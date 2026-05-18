import { NextResponse } from "next/server"
import { sendEmail, sendWelcomeEmail, sendDailyLoveQuote } from "@/lib/email/resend"

/**
 * 测试邮件发送 API
 * 用于调试邮件功能
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")
    const to = searchParams.get("to")
    const type = searchParams.get("type") || "welcome"

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!to) {
      return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 })
    }

    let result

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(to, "测试用户")
        break
      case "love":
        result = await sendDailyLoveQuote(to, "林屿", "早安，今天也是想你的每一天。")
        break
      case "verify":
        result = await sendEmail({
          to,
          subject: "【纸片人男友】测试邮件",
          html: `
            <div style="padding: 20px; font-family: sans-serif;">
              <h2>测试邮件</h2>
              <p>这是一封测试邮件，如果你能收到，说明邮件服务配置正确。</p>
              <p>时间：${new Date().toLocaleString("zh-CN")}</p>
            </div>
          `,
        })
        break
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success,
      type,
      to,
      id: result.id,
      error: result.error,
    })
  } catch (error) {
    console.error("[Test Email] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
