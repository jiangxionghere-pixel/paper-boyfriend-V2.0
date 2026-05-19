"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(login, undefined)

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="heading-section text-2xl text-white/80 mb-2">欢迎回来</h1>
        <p className="text-white/20 text-xs">登录以继续和你的他对话</p>
      </div>

      <form action={action} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/12" />
          <Input
            type="email"
            name="email"
            placeholder="邮箱地址"
            required
            autoComplete="email"
            className="pl-10 h-11 bg-white/[0.02] border-white/[0.05] rounded-xl text-white/60 placeholder:text-white/12 text-sm focus:border-white/[0.1] focus:ring-0"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/12" />
          <Input
            type="password"
            name="password"
            placeholder="密码"
            required
            autoComplete="current-password"
            className="pl-10 h-11 bg-white/[0.02] border-white/[0.05] rounded-xl text-white/60 placeholder:text-white/12 text-sm focus:border-white/[0.1] focus:ring-0"
          />
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-white/15 hover:text-white/30 text-[11px] transition-colors">
            忘记密码？
          </Link>
        </div>

        {state?.error && (
          <p className="text-rose-300/50 text-xs text-center py-2">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-11 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.1] text-white/60 rounded-xl text-sm transition-all"
        >
          {pending ? "登录中..." : "登录"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/[0.03]" />
        <span className="text-white/10 text-[10px]">或</span>
        <div className="flex-1 h-px bg-white/[0.03]" />
      </div>

      <p className="text-center text-white/15 text-xs">
        还没有账号？{" "}
        <Link href="/register" className="text-white/35 hover:text-white/55 transition-colors">
          注册
        </Link>
      </p>
    </div>
  )
}
