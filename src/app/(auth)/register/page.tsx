"use client"

import { useActionState, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signup } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { User, Mail, Lock, ShieldCheck } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(signup, undefined)
  const [turnstileToken, setTurnstileToken] = useState<string>("")
  const [turnstileError, setTurnstileError] = useState(false)

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token)
    setTurnstileError(false)
  }, [])

  const handleError = useCallback(() => {
    setTurnstileToken("")
    setTurnstileError(true)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (!turnstileToken) {
        e.preventDefault()
        setTurnstileError(true)
        return
      }
    },
    [turnstileToken]
  )

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <h1 className="heading-section text-2xl text-white/80 mb-2">开始相遇</h1>
        <p className="text-white/20 text-xs">创建你的账号，遇见命中注定的他</p>
      </div>

      <form action={action} onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/12" />
          <Input
            type="text"
            name="name"
            placeholder="你的昵称（选填）"
            autoComplete="name"
            className="pl-10 h-11 bg-white/[0.02] border-white/[0.05] rounded-xl text-white/60 placeholder:text-white/12 text-sm focus:border-white/[0.1] focus:ring-0"
          />
        </div>
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
            placeholder="密码（至少6位）"
            required
            minLength={6}
            autoComplete="new-password"
            className="pl-10 h-11 bg-white/[0.02] border-white/[0.05] rounded-xl text-white/60 placeholder:text-white/12 text-sm focus:border-white/[0.1] focus:ring-0"
          />
        </div>

        <input type="hidden" name="turnstileToken" value={turnstileToken} />

        <div className="pt-1">
          <TurnstileWidget onVerify={handleVerify} onError={handleError} onExpire={handleError} />
          {turnstileError && !turnstileToken && (
            <p className="text-rose-300/50 text-xs text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              请完成人机验证
            </p>
          )}
        </div>

        {state?.error && (
          <p className="text-rose-300/50 text-xs text-center py-2">{state.error}</p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-11 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.1] text-white/60 rounded-xl text-sm transition-all"
        >
          {pending ? "注册中..." : "注册"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/[0.03]" />
        <span className="text-white/10 text-[10px]">或</span>
        <div className="flex-1 h-px bg-white/[0.03]" />
      </div>

      <p className="text-center text-white/15 text-xs">
        已有账号？{" "}
        <Link href="/login" className="text-white/35 hover:text-white/55 transition-colors">
          登录
        </Link>
      </p>
    </div>
  )
}
