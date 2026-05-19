import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen gradient-ambient flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white/25" />
          </div>
          <span className="text-white/40 text-sm tracking-wide">纸片人男友</span>
        </Link>

        {children}
      </div>
    </div>
  )
}
