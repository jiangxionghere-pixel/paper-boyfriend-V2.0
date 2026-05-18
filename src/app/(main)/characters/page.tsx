import Link from "next/link"
import Image from "next/image"
import { Sparkles, ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"

export default async function CharactersPage() {
  const user = await getCurrentUser()
  const characters = await prisma.character.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      nameEn: true,
      age: true,
      occupation: true,
      tagline: true,
      personalityTags: true,
      avatarUrl: true,
      themeColor: true,
    },
  })

  return (
    <div className="relative min-h-screen">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-rose-200/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-amber-100/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/60 hover:bg-white/[0.03]">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            首页
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-200/30" />
          <span className="text-white/20 text-[11px] tracking-[0.2em] uppercase">选择你的他</span>
        </div>
        {user ? (
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/60 hover:bg-white/[0.03]">
              {user.name || user.email}
            </Button>
          </Link>
        ) : (
          <div className="w-20" />
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-32">
        {/* Title Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-light text-white/80 mb-5 tracking-tight">选择你的他</h1>
          <p className="text-white/25 text-base max-w-md mx-auto leading-relaxed">
            每一位都等待与你相遇。选择后可以随时切换，你的每段关系都会被认真对待。
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {characters.map((char, i) => (
            <Link
              key={char.id}
              href={`/characters/${char.id}`}
              className="group animate-fade-in-up character-card-glow"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="glass rounded-[2rem] overflow-hidden h-full transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.05)]">
                {/* Image Area - 修复为显示完整照片 */}
                <div className="relative aspect-[3/4] bg-white/[0.02] overflow-hidden">
                  {char.avatarUrl ? (
                    <Image
                      src={char.avatarUrl}
                      alt={char.name}
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-24 h-24 rounded-full opacity-10"
                        style={{ backgroundColor: char.themeColor }}
                      />
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(to top, ${char.themeColor}18 0%, transparent 50%)`,
                    }}
                  />

                  {/* Hover hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-white/50 text-sm font-light tracking-wider px-4 py-2 rounded-full glass">
                      了解他
                    </span>
                  </div>

                  {/* Bottom gradient */}
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0c0c12]/80 to-transparent" />
                </div>

                {/* Info Area */}
                <div className="p-6 -mt-4 relative">
                  <div className="flex items-baseline gap-2.5 mb-2">
                    <h3 className="text-xl font-medium text-white/80">{char.name}</h3>
                    <span className="text-white/20 text-sm">{char.age}岁</span>
                  </div>
                  <p className="text-white/25 text-xs mb-3 tracking-wide">{char.occupation}</p>
                  <p className="text-white/35 text-sm leading-relaxed mb-4 line-clamp-2">
                    {char.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {char.personalityTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] text-white/30 bg-white/[0.03] border border-white/[0.05]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
