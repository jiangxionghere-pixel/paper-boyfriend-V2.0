import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"
import { getAffinityStage } from "@/lib/affinity"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userCharacterId } = await request.json()
    if (!userCharacterId) {
      return NextResponse.json({ error: "Missing userCharacterId" }, { status: 400 })
    }

    const userCharacter = await prisma.userCharacter.findUnique({
      where: { id: userCharacterId },
      include: { character: true, user: true },
    })

    if (!userCharacter) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const stage = getAffinityStage(userCharacter.affinity)

    // 生成分享卡片数据
    const shareData = {
      title: `我与 ${userCharacter.character.name} 的故事`,
      description: `${userCharacter.character.tagline}`,
      character: {
        name: userCharacter.character.name,
        occupation: userCharacter.character.occupation,
        themeColor: userCharacter.character.themeColor,
        baselineImageUrl: userCharacter.character.baselineImageUrl,
      },
      stats: {
        affinity: userCharacter.affinity,
        stage,
        daysTogether: Math.floor(
          (Date.now() - userCharacter.selectedAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(shareData)
  } catch (error) {
    console.error("[Share] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
