"use client"

import { useActionState, useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { resetPassword } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, KeyRound, ArrowRight, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [state, action, pending] = useActionState(resetPassword, undefined)
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-white/40 mb-4">请先输入邮箱获取验证码</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-white/45 hover:text-white/70 text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          去获取验证码
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-light text-white/80 mb-3 tracking-tight">重置密码</h1>
        <p className="text-white/25 text-sm">
          验证码已发送至 <span className="text-white/40">{email}</span>
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="email" value={email} />

        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
          <Input
            type="text"
            name="code"
            placeholder="6位验证码"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white/70 placeholder:text-white/15 focus:border-white/15 focus:ring-0 transition-colors tracking-widest text-center"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
          <Input
            type="password"
            name="newPassword"
            placeholder="新密码（至少6位）"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-11 h-12 bg-white/[0.02] border-white/[0.06] rounded-xl text-white/70 placeholder:text-white/15 focus:border-white/15 focus:ring-0 transition-colors"
          />
        </div>

        {state?.error && (
          <p className="text-rose-300/60 text-sm text-center animate-fade-in py-2">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending || code.length !== 6}
          className="w-full h-12 bg-white/[0.07] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white/70 rounded-xl transition-all duration-300 btn-shine disabled:opacity-50"
        >
          {pending ? (
            <span className="text-white/40">重置中...</span>
          ) : (
            <>
              重置密码
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center space-y-3">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          重新发送验证码
        </Link>
        <div>
          <Link
            href="/login"
            className="text-white/25 hover:text-white/50 text-sm transition-colors"
          >
            想起密码了？去登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        <p className="text-white/30 text-sm mt-4">加载中...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
