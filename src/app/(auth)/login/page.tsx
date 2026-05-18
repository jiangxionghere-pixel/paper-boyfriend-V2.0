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
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-light text-white/80 mb-3 tracking-tight">欢迎回来</h1>
        <p className="text-white/25 text-sm">登录以继续和你的他对话</p>
      </div>

      {/* Form */}
      <form action={action} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
          <Input
            type="email"
            name="email"
            placeholder="邮箱地址"
            required
            autoComplete="email"
            className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white/70 placeholder:text-white/15 focus:border-white/15 focus:ring-0 transition-colors"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
          <Input
            type="password"
            name="password"
            placeholder="密码"
            required
            autoComplete="current-password"
            className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white/70 placeholder:text-white/15 focus:border-white/15 focus:ring-0 transition-colors"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-white/25 hover:text-white/50 text-xs transition-colors"
          >
            忘记密码？
          </Link>
        </div>

        {state?.error && (
          <p className="text-rose-300/60 text-sm text-center animate-fade-in py-2">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-12 bg-white/[0.07] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white/70 rounded-xl transition-all duration-300 btn-shine"
        >
          {pending ? (
            <span className="text-white/40">登录中...</span>
          ) : (
            <>
              登录
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-white/15 text-xs">或</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>

      {/* Register link */}
      <p className="text-center text-white/20 text-sm">
        还没有账号？{" "}
        <Link
          href="/register"
          className="text-white/45 hover:text-white/70 transition-colors duration-300"
        >
          注册
        </Link>
      </p>
    </div>
  )
}
