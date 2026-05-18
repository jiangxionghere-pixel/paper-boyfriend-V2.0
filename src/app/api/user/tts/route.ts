import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"

/**
 * 更新用户TTS设置
 * POST /api/user/tts
 * Body: { userCharacterId: string, ttsEnabled: boolean }
 */

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userCharacterId, ttsEnabled } = await request.json()

    if (!userCharacterId || typeof ttsEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing userCharacterId or ttsEnabled" },
        { status: 400 }
      )
    }

    // 验证用户角色关系属于当前用户
    const userCharacter = await prisma.userCharacter.findFirst({
      where: {
        id: userCharacterId,
        userId: session.userId,
      },
    })

    if (!userCharacter) {
      return NextResponse.json(
        { error: "User character not found" },
        { status: 404 }
      )
    }

    // 更新TTS设置
    const updated = await prisma.userCharacter.update({
      where: { id: userCharacterId },
      data: { ttsEnabled },
      select: { id: true, ttsEnabled: true },
    })

    return NextResponse.json({
      success: true,
      ttsEnabled: updated.ttsEnabled,
    })
  } catch (error) {
    console.error("[TTS Settings] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
