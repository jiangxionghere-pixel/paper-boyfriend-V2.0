import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendRecallEmail } from "@/lib/email/resend"

/**
 * 3天未对话召回邮件
 * 每天执行，给3天未对话的用户发送召回邮件
 * cron-job.org 定时触发: 0 10 * * * (上午10点)
 */

export const dynamic = "force-dynamic"

const RECALL_DAYS = 3

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - RECALL_DAYS * 24 * 60 * 60 * 1000)
    const fourDaysAgo = new Date(now.getTime() - (RECALL_DAYS + 1) * 24 * 60 * 60 * 1000)

    // 获取3天未对话的用户角色关系（且7天内没发过召回邮件）
    const userCharacters = await prisma.userCharacter.findMany({
      where: {
        lastChatAt: {
          gte: fourDaysAgo,
          lt: threeDaysAgo,
        },
        affinity: {
          gte: 30, // 至少有点感情基础才召回
        },
      },
      include: {
        user: true,
        character: true,
      },
    })

    const results = []

    for (const uc of userCharacters) {
      try {
        // 检查最近7天是否已发送过召回邮件
        const recentRecall = await prisma.affinityLog.findFirst({
          where: {
            userCharacterId: uc.id,
            reason: "召回邮件",
            createdAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        })

        if (recentRecall) {
          results.push({
            userId: uc.userId,
            characterId: uc.characterId,
            skipped: true,
            reason: "最近7天已发送过召回邮件",
          })
          continue
        }

        // 发送召回邮件
        const result = await sendRecallEmail(
          uc.user.email,
          uc.character.name,
          uc.character.themeColor
        )

        // 记录发送日志
        if (result.success) {
          await prisma.affinityLog.create({
            data: {
              userCharacterId: uc.id,
              delta: 0,
              reason: "召回邮件",
              triggers: [`连续${RECALL_DAYS}天未对话`],
              affinityBefore: uc.affinity,
              affinityAfter: uc.affinity,
            },
          })
        }

        results.push({
          userId: uc.userId,
          characterId: uc.characterId,
          success: result.success,
        })
      } catch (err) {
        console.error(`[Recall] Failed for ${uc.userId}/${uc.characterId}:`, err)
        results.push({
          userId: uc.userId,
          characterId: uc.characterId,
          success: false,
          error: String(err),
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: userCharacters.length,
      results,
    })
  } catch (error) {
    console.error("[Cron] Recall failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
