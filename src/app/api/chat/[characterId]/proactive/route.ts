import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"
import { sendProactiveMessage } from "@/lib/proactive"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const { characterId } = await params
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
      include: { character: true },
    })

    if (!userCharacter || userCharacter.characterId !== characterId) {
      return NextResponse.json({ error: "Invalid user character" }, { status: 403 })
    }

    await sendProactiveMessage(userCharacterId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Proactive API] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
