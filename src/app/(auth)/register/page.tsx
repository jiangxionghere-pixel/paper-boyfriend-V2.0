"use client"

import { useActionState, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signup } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react"

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
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-light text-white/80 mb-3 tracking-tight">开始相遇</h1>
        <p className="text-white/25 text-sm">创建你的账号，遇见命中注定的他</p>
      </div>

      {/* Form */}
      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
          <Input
            type="text"
            name="name"
            placeholder="你的昵称（选填）"
            autoComplete="name"
            className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white/70 placeholder:text-white/15 focus:border-white/15 focus:ring-0 transition-colors"
          />
        </div>
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
            placeholder="密码（至少6位）"
            required
            minLength={6}
            autoComplete="new-password"
            className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white/70 placeholder:text-white/15 focus:border-white/15 focus:ring-0 transition-colors"
          />
        </div>

        {/* Turnstile 人机验证 */}
        <div className="pt-2">
          <TurnstileWidget
            onVerify={handleVerify}
            onError={handleError}
            onExpire={handleError}
          />
          {turnstileError && !turnstileToken && (
            <p className="text-rose-300/60 text-xs text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              请完成人机验证
            </p>
          )}
        </div>

        {/* Hidden input for turnstile token */}
        <input type="hidden" name="turnstileToken" value={turnstileToken} />

        {state?.error && (
          <p className="text-rose-300/60 text-sm text-center animate-fade-in py-2">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending || !turnstileToken}
          className="w-full h-12 bg-white/[0.07] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white/70 rounded-xl transition-all duration-300 btn-shine disabled:opacity-50"
        >
          {pending ? (
            <span className="text-white/40">注册中...</span>
          ) : (
            <>
              注册
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

      {/* Login link */}
      <p className="text-center text-white/20 text-sm">
        已有账号？{" "}
        <Link
          href="/login"
          className="text-white/45 hover:text-white/70 transition-colors duration-300"
        >
          登录
        </Link>
      </p>
    </div>
  )
}
