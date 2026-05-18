import { NextResponse } from "next/server"
import { applyAffinityDecay } from "@/lib/affinity/decay"

/**
 * 情感系统阶段3：日衰减机制 Cron Job
 * 每日执行一次，检查并衰减超过7天未对话的 affinity
 *
 * 触发方式：
 * 1. Vercel Cron: 0 0 * * * (每天UTC 00:00)
 * 2. 手动触发: GET /api/cron/affinity-decay?secret=CRON_SECRET
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // 验证密钥（防止未授权访问）
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await applyAffinityDecay()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    console.error("[Cron] Affinity decay failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * 支持 Vercel Cron 的 POST 方法
 */
export async function POST(request: Request) {
  try {
    // Vercel Cron 会自动添加验证头
    const authHeader = request.headers.get("authorization")

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await applyAffinityDecay()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    console.error("[Cron] Affinity decay failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
