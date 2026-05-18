"use server"

import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createSession, destroySession, getSession } from "@/lib/auth/session"
import { sendWelcomeEmail } from "@/lib/email/resend"
import { redirect } from "next/navigation"

const signupSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位").max(100),
  name: z.string().min(1, "请输入昵称").max(50).optional(),
  turnstileToken: z.string().min(1, "请完成人机验证"),
})

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
})

/**
 * 验证 Turnstile token
 */
async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY || "",
          response: token,
        }),
      }
    )
    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("[Turnstile] Verification failed:", error)
    return false
  }
}

export async function signup(prevState: unknown, formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
    turnstileToken: formData.get("turnstileToken"),
  }

  const parsed = signupSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { email, password, name, turnstileToken } = parsed.data

  // 验证人机验证
  const isHuman = await verifyTurnstileToken(turnstileToken)
  if (!isHuman) {
    return { error: "人机验证失败，请重试" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "该邮箱已注册" }
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name || null },
  })

  await createSession({ userId: user.id, email: user.email })

  // 异步发送欢迎邮件（不阻塞注册流程）
  sendWelcomeEmail(email, name).catch((err) =>
    console.error("[Auth] Failed to send welcome email:", err)
  )

  return { success: true, redirectTo: "/characters" }
}

export async function login(prevState: unknown, formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "邮箱或密码错误" }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: "邮箱或密码错误" }
  }

  await createSession({ userId: user.id, email: user.email })

  return { success: true, redirectTo: "/characters" }
}

export async function logout() {
  await destroySession()
  return { success: true, redirectTo: "/" }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, avatarUrl: true },
  })
  return user
}
