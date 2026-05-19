import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"
import { getOrCreateUserCharacter } from "@/lib/characters"
import { ChatUI } from "@/components/chat/chat-ui"
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
    <div className="relative h-screen flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* Subtle ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 inset-x-0 h-48 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${character.themeColor}10 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 px-4 h-14 flex items-center justify-between shrink-0 border-b border-white/[0.03]"
      >
        <Link
          href="/characters"
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回
        </Link>

        <div className="text-center">
          <h2 className="text-white/60 text-sm font-medium">{character.name}</h2>
          <p className="text-white/15 text-[10px]">{character.occupation}</p>
        </div>

        <div className="flex items-center gap-0.5">
          <Link
            href={`/chat/${characterId}/history`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/40 hover:bg-white/[0.03] transition-colors"
          >
            <History className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/settings"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-white/40 hover:bg-white/[0.03] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
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
