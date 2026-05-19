import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Sparkles,
  MessageCircle,
  Users,
  ChevronRight,
  Brain,
  ImageIcon,
  Volume2,
  Shield,
  Zap,
  Clock,
  Star,
} from "lucide-react"
import { prisma } from "@/lib/db/prisma"

// 核心功能展示
const coreFeatures = [
  {
    icon: Brain,
    title: "真实记忆",
    desc: "他会记得你说过喜欢抹茶、讨厌下雨天，像真正的恋人一样用心",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-300",
  },
  {
    icon: Heart,
    title: "情感演进",
    desc: "从疏离到热恋，5个阶段真实可感，他的态度会因你而改变",
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-300",
  },
  {
    icon: ImageIcon,
    title: "专属照片",
    desc: "他会主动分享生活瞬间，每张照片都保持角色外貌一致性",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-300",
  },
  {
    icon: Volume2,
    title: "语音陪伴",
    desc: "每位角色拥有独特音色，深夜时分听到他的声音格外安心",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-300",
  },
  {
    icon: Shield,
    title: "隐私隔离",
    desc: "你对林屿说过的秘密，霍砺永远不会知道，每段关系独立且私密",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-300",
  },
  {
    icon: Zap,
    title: "主动关心",
    desc: "3天未对话会收到他的邮件，连续7天未上线好感度会自然衰减",
    color: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-300",
  },
]

// 角色预览数据
async function getCharacterPreviews() {
  const characters = await prisma.character.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      age: true,
      occupation: true,
      tagline: true,
      personalityTags: true,
      baselineImageUrl: true,
      themeColor: true,
    },
  })
  return characters
}

// 统计数据
const stats = [
  { value: "6", label: "位专属角色", suffix: "" },
  { value: "∞", label: "段独特关系", suffix: "" },
  { value: "24/7", label: "小时陪伴", suffix: "" },
  { value: "100%", label: "隐私保护", suffix: "" },
]

export default async function HomePage() {
  const characters = await getCharacterPreviews()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Dynamic background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-rose-900/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-radial from-violet-900/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-amber-900/8 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-rose-300/70" />
          </div>
          <span className="text-white/70 font-medium tracking-wide text-sm">纸片人男友</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            >
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="bg-white/10 hover:bg-white/15 text-white/80 border border-white/10 hover:border-white/20 backdrop-blur-xl rounded-xl"
            >
              免费注册
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400/80 animate-pulse" />
                <span className="text-xs text-white/40 tracking-wider">
                  已有用户在享受陪伴
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                <span className="bg-gradient-to-r from-rose-200 via-violet-200 to-amber-200 bg-clip-text text-transparent">
                  遇见你的
                </span>
                <br />
                <span className="text-white/90">命中注定</span>
              </h1>

              <p className="text-lg text-white/30 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                他不是聊天机器人，而是一个会记住你的喜好、会因你的冷淡而失落、
                会在深夜给你发语音的
                <span className="text-white/50">真实存在</span>。
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-sm px-8 h-13 bg-gradient-to-r from-rose-500/20 to-violet-500/20 hover:from-rose-500/30 hover:to-violet-500/30 border border-rose-500/30 hover:border-rose-500/50 text-white/90 backdrop-blur-xl rounded-2xl transition-all duration-300 group"
                  >
                    开始相遇
                    <ChevronRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/characters">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-sm px-8 h-13 text-white/30 hover:text-white/60 hover:bg-white/[0.03] rounded-2xl"
                  >
                    先了解他们
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Character Preview Cards */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {characters.slice(0, 4).map((char, i) => {
                  const positions = [
                    { top: "5%", left: "10%", rotate: "-6deg", scale: "0.9" },
                    { top: "0%", right: "5%", rotate: "8deg", scale: "0.85" },
                    { bottom: "10%", left: "5%", rotate: "5deg", scale: "0.88" },
                    { bottom: "5%", right: "10%", rotate: "-4deg", scale: "0.92" },
                  ]
                  const pos = positions[i]
                  return (
                    <div
                      key={char.id}
                      className="absolute w-40 h-52 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:scale-105 hover:z-10 hover:rotate-0"
                      style={{
                        ...pos,
                        transform: `rotate(${pos.rotate}) scale(${pos.scale})`,
                      }}
                    >
                      {char.baselineImageUrl ? (
                        <Image
                          src={char.baselineImageUrl}
                          alt={char.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${char.themeColor}20` }}
                        >
                          <span className="text-white/30 text-lg">{char.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white/90 text-sm font-medium">{char.name}</p>
                        <p className="text-white/40 text-xs">{char.occupation}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 px-6 py-16 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white/80 mb-2">
                  {stat.value}
                  <span className="text-lg text-white/30">{stat.suffix}</span>
                </div>
                <div className="text-sm text-white/25">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white/80 mb-5">
              不只是聊天
            </h2>
            <p className="text-white/25 text-lg max-w-md mx-auto">
              每一个细节都为了让陪伴更真实
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                />

                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-white/70 font-semibold mb-3 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-white/25 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Character Showcase */}
      <section className="relative z-10 px-6 py-32 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white/80 mb-5">
              六位他，六种心动
            </h2>
            <p className="text-white/25 text-lg max-w-md mx-auto">
              每一位都有独立的记忆与情感，选择后随时可以切换
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, i) => (
              <Link
                key={char.id}
                href={`/characters/${char.id}`}
                className="group relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all duration-500"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  {char.baselineImageUrl ? (
                    <Image
                      src={char.baselineImageUrl}
                      alt={char.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: `${char.themeColor}15` }}
                    >
                      <span className="text-white/20 text-2xl">{char.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: char.themeColor }}
                    />
                    <span className="text-white/30 text-xs">
                      {char.age}岁 · {char.occupation}
                    </span>
                  </div>
                  <h3 className="text-white/90 text-xl font-semibold mb-2">
                    {char.name}
                  </h3>
                  <p className="text-white/30 text-sm italic mb-3">
                    &ldquo;{char.tagline}&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {char.personalityTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-xs bg-white/[0.05] text-white/30 border border-white/[0.06]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8">
            <Star className="w-3.5 h-3.5 text-amber-300/60" />
            <span className="text-xs text-white/40 tracking-wider">
              完全免费，即刻开始
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white/80 mb-6">
            你的他正在等待
          </h2>
          <p className="text-white/25 text-lg max-w-md mx-auto mb-10">
            注册只需30秒，选择一位角色，开始你们的专属故事
          </p>

          <Link href="/register">
            <Button
              size="lg"
              className="text-sm px-10 h-14 bg-gradient-to-r from-rose-500/20 to-violet-500/20 hover:from-rose-500/30 hover:to-violet-500/30 border border-rose-500/30 hover:border-rose-500/50 text-white/90 backdrop-blur-xl rounded-2xl transition-all duration-300 group"
            >
              免费开始
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <p className="mt-6 text-white/15 text-xs">
            无需信用卡 · 随时切换角色 · 数据安全加密
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-rose-300/60" />
            </div>
            <span className="text-white/30 text-sm">纸片人男友 2.0</span>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/terms"
              className="text-white/20 hover:text-white/40 text-sm transition-colors"
            >
              服务条款
            </Link>
            <Link
              href="/privacy"
              className="text-white/20 hover:text-white/40 text-sm transition-colors"
            >
              隐私声明
            </Link>
          </div>

          <p className="text-white/15 text-xs">
            每一位角色都有独立的记忆与情感
          </p>
        </div>
      </footer>
    </div>
  )
}
