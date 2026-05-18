import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, MessageCircle, Users, ChevronRight } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "六位各具魅力的他",
    desc: "从温柔的游戏开发者到霸道的退役特种兵，总有一个让你心动。",
  },
  {
    icon: MessageCircle,
    title: "会记住你的每一句话",
    desc: "他会记得你喜欢什么、讨厌什么，像真的在关心你一样。",
  },
  {
    icon: Heart,
    title: "关系自然演进",
    desc: "从疏离到热恋，他的态度会随着你们的相处而慢慢改变。",
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-rose-200/[0.03] rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] bg-amber-100/[0.02] rounded-full blur-[100px] animate-pulse-glow animation-delay-500" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-violet-200/[0.02] rounded-full blur-[140px] animate-pulse-glow animation-delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-rose-200/50" />
          </div>
          <span className="text-white/60 font-medium tracking-wide text-sm">纸片人男友 2.0</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/[0.04]">
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white/60 hover:bg-white/[0.06] hover:border-white/20 hover:text-white/80"
            >
              注册
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass mb-10 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300/60 animate-gentle-pulse" />
            <span className="text-[11px] text-white/40 tracking-[0.2em] uppercase font-light">
              Paper Boyfriend 2.0
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-8 animate-fade-in-up animation-delay-100">
            <span className="gradient-text">纸片人男友</span>
            <br />
            <span className="text-white/80">遇见你的命中注定</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-white/30 max-w-md mx-auto mb-14 leading-relaxed animate-fade-in-up animation-delay-200">
            他不是一个聊天机器人，他是一个会记得你的喜好、
            会因为你的冷淡而失落、会在热恋时忍不住想见你的
            <span className="text-white/50">真实的他</span>。
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-24 animate-fade-in-up animation-delay-300">
            <Link href="/register">
              <Button
                size="lg"
                className="text-sm px-8 h-12 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white/80 backdrop-blur-xl rounded-2xl transition-all duration-300 btn-shine"
              >
                开始相遇
                <ChevronRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                size="lg"
                className="text-sm px-8 h-12 text-white/30 hover:text-white/60 hover:bg-white/[0.03] rounded-2xl transition-all duration-300"
              >
                我已有账号
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto w-full">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-3xl p-8 text-center group hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500 animate-fade-in-up character-card-glow"
              style={{ animationDelay: `${400 + i * 150}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 group-hover:bg-white/[0.05] group-hover:border-white/[0.08] transition-all duration-300">
                <f.icon className="w-5 h-5 text-white/25 group-hover:text-white/40 transition-colors duration-300" />
              </div>
              <h3 className="text-white/70 font-medium mb-3 text-base tracking-wide">{f.title}</h3>
              <p className="text-white/25 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-20 text-center animate-fade-in animation-delay-1000">
          <p className="text-white/15 text-xs tracking-wider">
            每一位角色都有独立的记忆与情感 · 你的每段关系都会被认真对待
          </p>
        </div>
      </main>
    </div>
  )
}
