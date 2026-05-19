import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
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
      age: true,
      occupation: true,
      tagline: true,
      personalityTags: true,
      baselineImageUrl: true,
      themeColor: true,
    },
  })

  return (
    <div className="relative min-h-screen gradient-ambient">
      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/25 hover:text-white/50 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          首页
        </Link>
        <span className="text-white/15 text-xs tracking-wider">选择你的他</span>
        {user ? (
          <Link
            href="/settings"
            className="text-white/25 hover:text-white/50 text-sm transition-colors"
          >
            {user.name || user.email}
          </Link>
        ) : (
          <div className="w-16" />
        )}
      </header>

      {/* Main */}
      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16">
            <h1 className="heading-display text-4xl md:text-5xl text-white/80 mb-4">
              选择你的<span className="text-gradient-warm">他</span>
            </h1>
            <p className="text-white/20 text-sm max-w-sm mx-auto">
              每一位都等待与你相遇。选择后可以随时切换。
            </p>
          </div>

          {/* Character Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char, i) => (
              <Link
                key={char.id}
                href={`/characters/${char.id}`}
                className="group relative rounded-2xl overflow-hidden glass-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  {char.baselineImageUrl ? (
                    <Image
                      src={char.baselineImageUrl}
                      alt={char.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: `${char.themeColor}10` }}
                    >
                      <span className="text-white/15 text-2xl">{char.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: char.themeColor }}
                    />
                    <span className="text-white/25 text-[11px]">
                      {char.age}岁 · {char.occupation}
                    </span>
                  </div>
                  <h3 className="text-white/80 text-lg font-medium mb-1">
                    {char.name}
                  </h3>
                  <p className="text-white/25 text-xs italic mb-3">
                    &ldquo;{char.tagline}&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {char.personalityTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.04] text-white/25 border border-white/[0.05]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/[0.05] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
