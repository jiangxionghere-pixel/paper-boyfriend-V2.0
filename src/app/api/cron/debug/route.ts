import { NextResponse } from "next/server"

/**
 * 调试 API：查看邮件配置状态
 * 用于确认环境变量是否正确读取
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config: {
        resendApiKeyConfigured: !!process.env.RESEND_API_KEY,
        resendApiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 10) + "...",
        fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        // 不暴露完整密钥
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
