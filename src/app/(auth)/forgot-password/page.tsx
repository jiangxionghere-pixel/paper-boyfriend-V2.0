"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { sendPasswordResetCode } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowRight, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(sendPasswordResetCode, undefined)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (state?.success && state?.email) {
      router.push(`/reset-password?email=${encodeURIComponent(state.email)}`)
    }
  }, [state, router])

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-light text-white/80 mb-3 tracking-tight">找回密码</h1>
        <p className="text-white/25 text-sm">输入注册邮箱，我们将发送验证码</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
          <Input
            type="email"
            name="email"
            placeholder="注册邮箱地址"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          disabled={pending}
          className="w-full h-12 bg-white/[0.07] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white/70 rounded-xl transition-all duration-300 btn-shine"
        >
          {pending ? (
            <span className="text-white/40">发送中...</span>
          ) : (
            <>
              发送验证码
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          返回登录
        </Link>
      </div>
    </div>
  )
}
