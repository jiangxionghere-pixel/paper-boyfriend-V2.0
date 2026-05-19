import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { TTSPlayer } from "@/components/chat/tts-player"
import { ArrowLeft, Calendar, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

const MESSAGES_PER_PAGE = 30

function formatDate(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return "今天"
  if (days === 1) return "昨天"
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`

  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
}

function groupMessagesByDate(messages: Array<{ createdAt: Date }>) {
  const groups: Record<string, Date> = {}

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt)
    const key = date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    if (!groups[key]) {
      groups[key] = date
    }
  })

  return Object.entries(groups)
    .sort((a, b) => b[1].getTime() - a[1].getTime())
    .map(([label]) => label)
}

export default async function ChatHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ characterId: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { characterId } = await params
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10))

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const character = await prisma.character.findUnique({
    where: { id: characterId },
  })
  if (!character) redirect("/characters")

  const userCharacter = await prisma.userCharacter.findUnique({
    where: {
      userId_characterId: {
        userId: user.id,
        characterId,
      },
    },
  })

  if (!userCharacter) redirect(`/characters/${characterId}`)

  // 获取总消息数
  const totalMessages = await prisma.message.count({
    where: { userCharacterId: userCharacter.id },
  })

  const totalPages = Math.ceil(totalMessages / MESSAGES_PER_PAGE)

  // 分页查询消息
  const messages = await prisma.message.findMany({
    where: { userCharacterId: userCharacter.id },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * MESSAGES_PER_PAGE,
    take: MESSAGES_PER_PAGE,
    select: {
      id: true,
      role: true,
      content: true,
      imageUrl: true,
      audioUrl: true,
      createdAt: true,
    },
  })

  const dateGroups = groupMessagesByDate(messages)

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03]"
          style={{ backgroundColor: character.themeColor }} />
      </div>

      <header className="relative z-10 px-6 py-6 flex items-center max-w-2xl mx-auto">
        <Link href={`/chat/${characterId}`}>
          <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/60 hover:bg-white/[0.03]">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            返回对话
          </Button>
        </Link>
        <div className="flex-1 text-center">
          <span className="text-white/30 text-xs tracking-widest uppercase">聊天记录</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="relative z-10 px-6 pb-32 max-w-2xl mx-auto">
        {/* Character info */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${character.themeColor}15`, border: `1px solid ${character.themeColor}20` }}
          >
            <MessageCircle className="w-7 h-7" style={{ color: `${character.themeColor}90` }} />
          </div>
          <h1 className="text-xl font-light text-white/70 mb-1">{character.name}</h1>
          <p className="text-white/20 text-sm">{totalMessages} 条消息 · 第 {currentPage}/{totalPages} 页</p>
        </div>

        {/* Messages grouped by date */}
        <div className="space-y-8">
          {dateGroups.map((dateLabel, groupIndex) => {
            const dayMessages = messages.filter((m) => {
              const d = new Date(m.createdAt)
              return d.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) === dateLabel
            })

            return (
              <div key={dateLabel} className="animate-fade-in-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                {/* Date divider */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <div className="flex items-center gap-1.5 text-white/15 text-xs">
                    <Calendar className="w-3 h-3" />
                    {dateLabel}
                  </div>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {dayMessages.reverse().map((msg, i) => (
                    <div
                      key={msg.id}
                      className="glass rounded-2xl p-4 hover:bg-white/[0.04] transition-colors"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium"
                          style={{
                            backgroundColor: msg.role === "user"
                              ? `${character.themeColor}20`
                              : "rgba(255,255,255,0.05)",
                            color: msg.role === "user"
                              ? `${character.themeColor}cc`
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {msg.role === "user" ? "你" : character.name[0]}
                        </div>
                        <span className="text-white/20 text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      {msg.imageUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.06]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.imageUrl}
                            alt="照片"
                            className="w-full max-h-[200px] object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      {/* 历史记录中的语音 - 默认不自动播放 */}
                      {msg.role === "assistant" && msg.audioUrl && (
                        <div className="mt-3">
                          <TTSPlayer 
                            audioUrl={msg.audioUrl} 
                            themeColor={character.themeColor}
                            autoPlay={false}
                            isMuted={false}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {currentPage > 1 && (
              <Link href={`/chat/${characterId}/history?page=${currentPage - 1}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </Button>
              </Link>
            )}
            <span className="text-white/20 text-sm px-4">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link href={`/chat/${characterId}/history?page=${currentPage + 1}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${character.themeColor}10`, border: `1px solid ${character.themeColor}15` }}
            >
              <MessageCircle className="w-5 h-5" style={{ color: `${character.themeColor}50` }} />
            </div>
            <p className="text-white/20 text-sm">还没有聊天记录</p>
            <p className="text-white/10 text-xs mt-1">开始对话后，这里会显示完整记录</p>
          </div>
        )}
      </main>
    </div>
  )
}
