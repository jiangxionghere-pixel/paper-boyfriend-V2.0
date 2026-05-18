import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-200/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-violet-200/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-12 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-rose-200/40" />
          </div>
          <span className="text-white/40 text-sm tracking-wide">纸片人男友 2.0</span>
        </div>
      </Link>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-12 text-center animate-fade-in animation-delay-500">
        <p className="text-white/10 text-xs tracking-wider">
          你的每段关系都会被认真对待
        </p>
      </div>
    </div>
  )
}
