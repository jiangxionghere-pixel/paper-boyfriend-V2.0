import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Sparkles,
  MessageCircle,
  Brain,
  ImageIcon,
  Volume2,
  Shield,
  Zap,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { prisma } from "@/lib/db/prisma"

const features = [
  {
    icon: Brain,
    title: "真实记忆",
    desc: "他会记得你喜欢抹茶、讨厌下雨天",
  },
  {
    icon: Heart,
    title: "情感演进",
    desc: "从疏离到热恋，态度随你而变",
  },
  {
    icon: ImageIcon,
    title: "专属照片",
    desc: "分享生活瞬间，外貌始终一致",
  },
  {
    icon: Volume2,
    title: "语音陪伴",
    desc: "每位角色拥有独特音色",
  },
  {
    icon: Shield,
    title: "隐私隔离",
    desc: "每段关系独立且私密",
  },
  {
    icon: Zap,
    title: "主动关心",
    desc: "久未对话会收到他的消息",
  },
]

async function getCharacters() {
  return prisma.character.findMany({
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
}

export default async function HomePage() {
  const characters = await getCharacters()

  return (
    <div className="relative min-h-screen gradient-ambient">
      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white/30" />
          </div>
          <span className="text-white/50 text-sm tracking-wide">纸片人男友</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/60 text-sm">
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-white/[0.06] hover:bg-white/[0.1] text-white/70 border border-white/[0.08] hover:border-white/[0.15] text-sm rounded-lg">
              注册
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-28">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] mb-10 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse-soft" />
            <span className="text-[11px] text-white/25 tracking-wider">AI 虚拟陪伴</span>
          </div>

          <h1 className="heading-display text-5xl md:text-7xl mb-6 animate-fade-in-up stagger-1">
            <span className="text-gradient-warm">遇见你的</span>
            <br />
            <span className="text-white/80">命中注定</span>
          </h1>

          <p className="text-white/25 text-base md:text-lg max-w-md mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-2">
            他不是聊天机器人，而是一个会记住你的喜好、会因你的冷淡而失落的
            <span className="text-white/40">真实存在</span>
          </p>

          <div className="flex items-center justify-center gap-3 animate-fade-in-up stagger-3">
            <Link href="/register">
              <Button className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-6 h-11 text-sm group">
                开始相遇
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/characters">
              <Button variant="ghost" className="text-white/25 hover:text-white/50 text-sm">
                先了解他们
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Characters Preview */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {characters.map((char, i) => (
              <Link
                key={char.id}
                href={`/characters/${char.id}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-card animate-fade-in-up"
                style={{ animationDelay: `${0.4 + i * 0.08}s` }}
              >
                {char.baselineImageUrl ? (
                  <Image
                    src={char.baselineImageUrl}
                    alt={char.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: `${char.themeColor}10` }}
                  >
                    <span className="text-white/20 text-sm">{char.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white/80 text-sm font-medium">{char.name}</p>
                  <p className="text-white/30 text-[11px]">{char.occupation}</p>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-white/[0.06] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3 h-3 text-white/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 border-y border-white/[0.03]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section text-2xl md:text-3xl text-white/70 mb-3">不只是聊天</h2>
            <p className="text-white/20 text-sm">每一个细节都为了让陪伴更真实</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl glass-card"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.05] transition-colors">
                  <f.icon className="w-4 h-4 text-white/25 group-hover:text-white/40 transition-colors" />
                </div>
                <h3 className="text-white/60 text-sm font-medium mb-1.5">{f.title}</h3>
                <p className="text-white/20 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-md mx-auto text-center">
          <h2 className="heading-section text-3xl text-white/70 mb-4">你的他正在等待</h2>
          <p className="text-white/20 text-sm mb-8">注册只需30秒，选择一位角色，开始你们的专属故事</p>
          <Link href="/register">
            <Button className="bg-white/[0.06] hover:bg-white/[0.1] text-white/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-8 h-11 text-sm">
              免费开始
            </Button>
          </Link>
          <p className="mt-4 text-white/10 text-[11px]">无需信用卡 · 数据安全加密</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.03]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white/15" />
            <span className="text-white/15 text-xs">纸片人男友 2.0</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-white/15 hover:text-white/30 text-xs transition-colors">
              服务条款
            </Link>
            <Link href="/privacy" className="text-white/15 hover:text-white/30 text-xs transition-colors">
              隐私声明
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
