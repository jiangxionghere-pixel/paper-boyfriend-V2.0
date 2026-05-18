import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendDailyLoveQuote } from "@/lib/email/resend"

/**
 * 诊断 API - 检查邮件系统状态
 * 用于排查邮件发送问题
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const diagnostics: Record<string, unknown> = {}

    // 1. 检查环境变量
    diagnostics.env = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? `已设置 (${process.env.RESEND_API_KEY.slice(0, 8)}...)` : "未设置",
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "未设置（使用默认值）",
      CRON_SECRET: process.env.CRON_SECRET ? "已设置" : "未设置",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "未设置",
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? "已设置" : "未设置",
    }

    // 2. 检查数据库中的用户角色关系
    const userCharacterCount = await prisma.userCharacter.count()
    const userCharacters = await prisma.userCharacter.findMany({
      take: 5,
      include: {
        user: { select: { email: true, name: true } },
        character: { select: { name: true, themeColor: true } },
      },
    })

    diagnostics.database = {
      userCharacterCount,
      sampleRecords: userCharacters.map((uc) => ({
        userEmail: uc.user.email,
        characterName: uc.character.name,
        affinity: uc.affinity,
      })),
    }

    // 3. 如果提供了 testEmail 参数，直接发送测试邮件
    const testEmail = searchParams.get("testEmail")
    if (testEmail) {
      console.log(`[Diagnostic] Sending test email to ${testEmail}`)
      const result = await sendDailyLoveQuote(
        testEmail,
        "林屿",
        "早安，这是一封测试邮件。如果你收到了，说明邮件服务正常工作。"
      )
      diagnostics.testEmailResult = {
        to: testEmail,
        success: result.success,
        id: result.id,
        error: result.error || null,
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    })
  } catch (error) {
    console.error("[Diagnostic] Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
