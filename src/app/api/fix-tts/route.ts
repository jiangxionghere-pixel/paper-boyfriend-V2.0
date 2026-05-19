import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 将所有用户的 ttsEnabled 重置为 true，ttsMuted 设为 false
    const result = await prisma.userCharacter.updateMany({
      where: { userId: session.userId },
      data: {
        ttsEnabled: true,
        ttsMuted: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: `已修复 ${result.count} 个角色的 TTS 设置`,
      ttsEnabled: true,
      ttsMuted: false,
    })
  } catch (error) {
    console.error("[Fix TTS] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
