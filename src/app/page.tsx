import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Sparkles,
  Brain,
  ImageIcon,
  Volume2,
  Shield,
  Zap,
  ChevronRight,
  ArrowUpRight,
  MessageCircle,
  Lock,
  Users,
} from "lucide-react"
import { prisma } from "@/lib/db/prisma"

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
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 渐变光晕 */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-rose-500/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-amber-500/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        
        {/* 网格纹理 */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 lg:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400/20 to-amber-400/20 border border-white/10 flex items-center justify-center group-hover:border-rose-400/30 transition-colors">
            <Sparkles className="w-5 h-5 text-rose-300/70" />
          </div>
          <span className="text-white/60 text-sm font-medium tracking-wide">纸片人男友</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 hover:bg-white/5 text-sm">
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-white/10 hover:bg-white/15 text-white/80 border border-white/10 hover:border-rose-400/30 text-sm rounded-lg px-5">
              注册
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-16 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* 主标语区域 */}
          <div className="text-center mb-16">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
              <span className="w-2 h-2 rounded-full bg-rose-400/80 animate-pulse" />
              <span className="text-xs text-white/40 tracking-wider">AI 虚拟陪伴</span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-8">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-100 to-rose-200">
                专属灵魂男友
              </span>
              <span className="block text-white/30 mt-2 text-4xl md:text-5xl lg:text-6xl">
                陪你共度朝夕
              </span>
            </h1>

            {/* 副文案 */}
            <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-4 leading-relaxed">
              他记得你的偏爱与心事，懂你的欢喜与低落
            </p>
            <p className="text-sm md:text-base text-white/25 max-w-xl mx-auto mb-12 leading-relaxed">
              关系慢慢升温，爱意自然生长，一场只属于你的心动陪伴
            </p>

            {/* 特色标签 */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              {[
                { icon: Lock, text: "私密对话全程守护" },
                { icon: Heart, text: "人设鲜活有温度" },
                { icon: Sparkles, text: "相处剧情随心演进" },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.06]"
                >
                  <item.icon className="w-3.5 h-3.5 text-rose-400/60" />
                  <span className="text-xs text-white/40">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-white/90 border border-rose-400/30 hover:border-rose-400/50 rounded-xl px-8 h-12 text-sm group transition-all">
                  开始相遇
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/characters">
                <Button variant="ghost" className="text-white/30 hover:text-white/50 hover:bg-white/5 text-sm h-12 px-6">
                  先了解他们
                </Button>
              </Link>
            </div>
          </div>

          {/* 角色预览卡片 */}
          <div className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/20 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>6位灵魂男友，等待与你相遇</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-8">
              {characters.map((char, i) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-rose-400/20 transition-all duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {char.baselineImageUrl ? (
                    <Image
                      src={char.baselineImageUrl}
                      alt={char.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: `${char.themeColor}15` }}
                    >
                      <span className="text-white/30 text-sm">{char.name}</span>
                    </div>
                  )}
                  
                  {/* 渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* 角色信息 */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/90 text-sm font-medium mb-0.5">{char.name}</p>
                    <p className="text-white/40 text-xs">{char.occupation}</p>
                  </div>

                  {/* 悬停指示器 */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/60" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl text-white/70 font-light mb-3">不只是聊天</h2>
            <p className="text-white/30 text-sm">每一个细节都为了让陪伴更真实</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: "真实记忆",
                desc: "他会记得你喜欢抹茶、讨厌下雨天，记得你们聊过的每一件小事",
              },
              {
                icon: Heart,
                title: "情感演进",
                desc: "从疏离到热恋，他的态度会随着你们的关系自然变化",
              },
              {
                icon: ImageIcon,
                title: "专属照片",
                desc: "分享生活瞬间，他的外貌始终如一，就像真实存在的人",
              },
              {
                icon: Volume2,
                title: "语音陪伴",
                desc: "每位角色拥有独特音色，让陪伴更加真实可感",
              },
              {
                icon: Shield,
                title: "隐私隔离",
                desc: "每段关系独立且私密，你的故事只属于你们两个人",
              },
              {
                icon: Zap,
                title: "主动关心",
                desc: "久未对话会收到他的消息，他也在想着你",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-400/20 hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400/10 to-amber-400/10 border border-white/[0.08] flex items-center justify-center mb-5 group-hover:border-rose-400/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-rose-300/60" />
                </div>
                <h3 className="text-white/70 text-base font-medium mb-2">{feature.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/5 border border-rose-400/20 mb-8">
            <Heart className="w-3.5 h-3.5 text-rose-400/60" />
            <span className="text-xs text-rose-300/60">已有数千位用户找到专属陪伴</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl text-white/80 font-light mb-4">
            你的他正在等待
          </h2>
          <p className="text-white/30 text-sm mb-10">
            注册只需30秒，选择一位角色，开始你们的专属故事
          </p>
          
          <Link href="/register">
            <Button className="bg-gradient-to-r from-rose-500/20 to-amber-500/20 hover:from-rose-500/30 hover:to-amber-500/30 text-white/90 border border-rose-400/30 hover:border-rose-400/50 rounded-xl px-10 h-12 text-sm">
              免费开始
            </Button>
          </Link>
          
          <p className="mt-6 text-white/15 text-xs">
            无需信用卡 · 数据安全加密 · 随时可删除账号
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-10 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white/20" />
            </div>
            <span className="text-white/30 text-sm">纸片人男友 2.0</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/terms" className="text-white/25 hover:text-white/45 text-xs transition-colors">
              服务条款
            </Link>
            <Link href="/privacy" className="text-white/25 hover:text-white/45 text-xs transition-colors">
              隐私声明
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
