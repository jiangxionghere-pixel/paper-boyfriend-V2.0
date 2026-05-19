import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"
import { getOrCreateUserCharacter } from "@/lib/characters"
import { ChatUI } from "@/components/chat/chat-ui"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, History } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ characterId: string }>
}) {
  const { characterId } = await params
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const character = await prisma.character.findUnique({
    where: { id: characterId },
  })
  if (!character) redirect("/characters")

  const userCharacter = await getOrCreateUserCharacter(user.id, characterId)

  const messages = await prisma.message.findMany({
    where: { userCharacterId: userCharacter.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      imageUrl: true,
      audioUrl: true,
      createdAt: true,
    },
  })

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `${character.themeColor}03` }}>
        <div className="absolute top-0 inset-x-0 h-64 opacity-30"
          style={{ background: `radial-gradient(ellipse at center, ${character.themeColor}15 0%, transparent 70%)` }} />
      </div>

      <header
        className="relative z-10 px-4 py-4 flex items-center justify-between shrink-0"
        style={{ borderBottom: `1px solid ${character.themeColor}10` }}
      >
        <Link href="/characters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            角色列表
          </Button>
        </Link>
        <div className="text-center">
          <h2 className="text-white/70 font-medium text-sm">{character.name}</h2>
          <p className="text-white/15 text-[10px]">{character.occupation}</p>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/chat/${characterId}/history`}>
            <Button variant="ghost" size="icon">
              <History className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <ChatUI
        characterId={characterId}
        userCharacterId={userCharacter.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          imageUrl: m.imageUrl,
          audioUrl: m.audioUrl,
          createdAt: m.createdAt.toISOString(),
        }))}
        themeColor={character.themeColor}
        userAvatarUrl={user.avatarUrl}
        characterAvatarUrl={character.avatarUrl}
        initialTtsEnabled={userCharacter.ttsEnabled}
        initialTtsMuted={userCharacter.ttsMuted}
      />
    </div>
  )
}
