import { NextResponse } from "next/server"
import {
  sendEmail,
  sendWelcomeEmail,
  sendDailyLoveQuote,
  sendVerificationCodeEmail,
  sendRecallEmail,
} from "@/lib/email/resend"

/**
 * 测试邮件发送 API
 * 用于调试邮件功能
 * 支持类型: welcome, love, verify, recall
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
        result = await sendVerificationCodeEmail(to, "123456")
        break
      case "recall":
        result = await sendRecallEmail(
          to,
          "林屿",
          "#7B8FA1",
          "这几天... 代码写得不太顺，可能是因为没人催我休息吧。",
          "lin-yu"
        )
        break
      default:
        return NextResponse.json({ error: "Invalid type. Supported: welcome, love, verify, recall" }, { status: 400 })
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
