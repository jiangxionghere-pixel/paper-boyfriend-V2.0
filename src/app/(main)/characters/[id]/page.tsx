import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"
import { getOrCreateUserCharacter } from "@/lib/characters"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Heart, MessageCircle, BookOpen, Mic, Star } from "lucide-react"

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const character = await prisma.character.findUnique({ where: { id } })
  if (!character) notFound()

  async function startChat() {
    "use server"
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect("/login")
    await getOrCreateUserCharacter(currentUser.id, id)
    redirect(`/chat/${id}`)
  }

  const loveThresholdLabels: Record<string, string> = {
    low: "容易说出口",
    medium: "自然说出口",
    high: "需要氛围",
    extreme: "极少说出口",
  }

  const infoCards = [
    {
      icon: BookOpen,
      title: "成长背景",
      content: character.background,
    },
    {
      icon: Mic,
      title: "说话风格",
      content: character.speakingStyle,
    },
    {
      icon: Star,
      title: "行为偏好",
      content: character.habits,
    },
    {
      icon: Heart,
      title: "表白门槛",
      content: loveThresholdLabels[character.loveThreshold] || "中等",
    },
  ]

  return (
    <div className="relative min-h-screen gradient-ambient">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.03]"
          style={{ backgroundColor: character.themeColor }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center max-w-6xl mx-auto">
        <Link
          href="/characters"
          className="inline-flex items-center gap-2 text-white/25 hover:text-white/50 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left - Photo */}
          <div className="relative">
            <div className="lg:sticky lg:top-6">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-strong">
                {character.baselineImageUrl ? (
                  <Image
                    src={character.baselineImageUrl}
                    alt={character.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full opacity-10"
                      style={{ backgroundColor: character.themeColor }}
                    />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 70%, ${character.themeColor}08 100%)`,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-white/10 text-[10px] tracking-wider">BASELINE</span>
                <span className="text-white/15 text-[10px]">{character.nameEn}</span>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="flex flex-col">
            {/* Name */}
            <div className="mb-8">
              <h1 className="heading-display text-4xl lg:text-5xl text-white/80 mb-3">
                {character.name}
              </h1>
              <div className="flex items-center gap-3 text-white/25 text-xs mb-5 flex-wrap">
                <span>{character.age}岁</span>
                <span className="text-white/8">·</span>
                <span>{character.mbti}</span>
                <span className="text-white/8">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {character.city}
                </span>
                <span className="text-white/8">·</span>
                <span>{character.occupation}</span>
              </div>
              <div className="relative pl-4 border-l" style={{ borderColor: `${character.themeColor}30` }}>
                <p className="text-white/35 text-base italic leading-relaxed">
                  &ldquo;{character.tagline}&rdquo;
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {character.personalityTags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs border"
                  style={{
                    color: `${character.themeColor}aa`,
                    borderColor: `${character.themeColor}20`,
                    backgroundColor: `${character.themeColor}06`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Info Cards */}
            <div className="space-y-3 mb-8">
              {infoCards.map((card) => (
                <div
                  key={card.title}
                  className="p-5 rounded-xl glass-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${character.themeColor}10` }}
                    >
                      <card.icon className="w-3.5 h-3.5" style={{ color: character.themeColor }} />
                    </div>
                    <h3 className="text-white/50 text-sm font-medium">{card.title}</h3>
                  </div>
                  <p className="text-white/25 text-xs leading-relaxed pl-11">
                    {card.content}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <form action={startChat}>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.01]"
                style={{
                  backgroundColor: `${character.themeColor}12`,
                  border: `1px solid ${character.themeColor}25`,
                  color: `${character.themeColor}cc`,
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                开始相处
              </Button>
            </form>
            <p className="mt-3 text-center text-white/10 text-[11px]">
              开始相处后，关系会从初始状态自然演进
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
