import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"
import { getOrCreateUserCharacter } from "@/lib/characters"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Heart, MessageCircle, Sparkles, BookOpen, Mic, Star } from "lucide-react"

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

  return (
    <div className="relative min-h-screen">
      {/* Ambient glow with character theme color */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.04]"
          style={{ backgroundColor: character.themeColor }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.02]"
          style={{ backgroundColor: character.themeColor }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center max-w-6xl mx-auto">
        <Link href="/characters">
          <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/60 hover:bg-white/[0.03]">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            返回
          </Button>
        </Link>
      </header>

      {/* Main Content - Magazine Editorial Layout */}
      <main className="relative z-10 px-6 pb-32 max-w-6xl mx-auto animate-fade-in-up">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Photo */}
          <div className="relative">
            <div className="sticky top-8">
              {/* Main Photo Frame */}
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden glass-strong">
                {character.baselineImageUrl ? (
                  <Image
                    src={character.baselineImageUrl}
                    alt={character.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-32 h-32 rounded-full opacity-10"
                      style={{ backgroundColor: character.themeColor }}
                    />
                  </div>
                )}
                
                {/* Subtle gradient overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, transparent 60%, ${character.themeColor}10 100%)`
                  }}
                />
                
                {/* Corner accent */}
                <div 
                  className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10"
                  style={{ backgroundColor: `${character.themeColor}20` }}
                >
                  <Heart className="w-5 h-5" style={{ color: character.themeColor }} />
                </div>
              </div>

              {/* Photo caption */}
              <div className="mt-4 flex items-center justify-between px-2">
                <span className="text-white/20 text-xs tracking-wider">BASELINE PHOTO</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: character.themeColor }} />
                  <span className="text-white/30 text-xs">{character.nameEn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex flex-col">
            {/* Name Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-5xl lg:text-6xl font-light text-white/90 tracking-tight">
                  {character.name}
                </h1>
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${character.themeColor}15` }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: character.themeColor }} />
                </div>
              </div>
              
              {/* Meta row */}
              <div className="flex items-center gap-4 text-white/30 text-sm mb-6 flex-wrap">
                <span className="text-white/50 font-medium">{character.age}岁</span>
                <span className="text-white/10">|</span>
                <span>{character.mbti}</span>
                <span className="text-white/10">|</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{character.city}</span>
                </div>
                <span className="text-white/10">|</span>
                <span>{character.occupation}</span>
                {(() => {
                  const zodiacSigns = ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"]
                  const zodiac = character.personalityTags.find(tag => zodiacSigns.includes(tag))
                  return zodiac ? (
                    <>
                      <span className="text-white/10">|</span>
                      <span>{zodiac}</span>
                    </>
                  ) : null
                })()}
              </div>

              {/* Tagline - Large quote style */}
              <div className="relative pl-6 border-l-2" style={{ borderColor: `${character.themeColor}40` }}>
                <p className="text-xl lg:text-2xl text-white/50 italic leading-relaxed font-light">
                  &ldquo;{character.tagline}&rdquo;
                </p>
              </div>
            </div>

            {/* Tags - 过滤掉星座标签 */}
            <div className="flex flex-wrap gap-2 mb-10">
              {(() => {
                const zodiacSigns = ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"]
                return character.personalityTags
                  .filter(tag => !zodiacSigns.includes(tag))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-full text-sm border transition-all duration-300 hover:scale-105"
                      style={{
                        color: `${character.themeColor}cc`,
                        borderColor: `${character.themeColor}25`,
                        backgroundColor: `${character.themeColor}08`,
                      }}
                    >
                      {tag}
                    </span>
                  ))
              })()}
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 gap-5 mb-10">
              {/* Background Card */}
              <div className="glass rounded-2xl p-6 group hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${character.themeColor}12` }}
                  >
                    <BookOpen className="w-4 h-4" style={{ color: character.themeColor }} />
                  </div>
                  <h2 className="text-white/70 font-medium text-base tracking-wide">成长背景</h2>
                </div>
                <p className="text-white/35 text-sm leading-relaxed pl-13">
                  {character.background}
                </p>
              </div>

              {/* Speaking Style Card */}
              <div className="glass rounded-2xl p-6 group hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${character.themeColor}12` }}
                  >
                    <Mic className="w-4 h-4" style={{ color: character.themeColor }} />
                  </div>
                  <h2 className="text-white/70 font-medium text-base tracking-wide">说话风格</h2>
                </div>
                <p className="text-white/35 text-sm leading-relaxed pl-13">
                  {character.speakingStyle}
                </p>
              </div>

              {/* Habits Card */}
              <div className="glass rounded-2xl p-6 group hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${character.themeColor}12` }}
                  >
                    <Star className="w-4 h-4" style={{ color: character.themeColor }} />
                  </div>
                  <h2 className="text-white/70 font-medium text-base tracking-wide">行为偏好</h2>
                </div>
                <p className="text-white/35 text-sm leading-relaxed pl-13">
                  {character.habits}
                </p>
              </div>

              {/* Love Threshold Card */}
              <div className="glass rounded-2xl p-6 group hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${character.themeColor}12` }}
                  >
                    <Heart className="w-4 h-4" style={{ color: character.themeColor }} />
                  </div>
                  <h2 className="text-white/70 font-medium text-base tracking-wide">表白门槛</h2>
                </div>
                <p className="text-white/35 text-sm leading-relaxed pl-13">
                  {loveThresholdLabels[character.loveThreshold] || "中等"}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <form action={startChat} className="mt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 rounded-2xl text-base font-medium transition-all duration-300 btn-shine hover:scale-[1.02]"
                style={{
                  backgroundColor: `${character.themeColor}18`,
                  border: `1px solid ${character.themeColor}30`,
                  color: `${character.themeColor}cc`,
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                开始相处
              </Button>
            </form>

            {/* Bottom hint */}
            <div className="mt-6 text-center">
              <p className="text-white/15 text-xs tracking-wider">
                开始相处后，你们的关系会从初始状态自然演进
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
