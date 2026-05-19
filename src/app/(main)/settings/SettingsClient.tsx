"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, MessageCircle, ChevronRight, Camera, User } from "lucide-react"
import Image from "next/image"

interface SettingsClientProps {
  user: {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
  }
  userCharacters: Array<{
    id: string
    character: {
      id: string
      name: string
      occupation: string
      themeColor: string
    }
  }>
}

export default function SettingsClient({ user, userCharacters }: SettingsClientProps) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)
      const response = await fetch("/api/user/avatar", { method: "POST", body: formData })
      if (response.ok) {
        const data = await response.json()
        setAvatarUrl(data.avatarUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <div className="relative min-h-screen gradient-ambient">
      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center max-w-xl mx-auto">
        <Link href="/characters" className="inline-flex items-center gap-2 text-white/25 hover:text-white/50 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <div className="flex-1 text-center">
          <span className="text-white/15 text-xs tracking-wider">设置</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="relative z-10 px-6 pb-24 max-w-xl mx-auto">
        {/* User Profile */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="relative w-14 h-14 rounded-xl bg-white/[0.03] flex items-center justify-center overflow-hidden group hover:bg-white/[0.05] transition-colors border border-white/[0.05]"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill className="object-cover" />
              ) : (
                <User className="w-6 h-6 text-white/15" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white/60" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div>
              <h2 className="text-white/70 font-medium">{user.name || "未设置昵称"}</h2>
              <p className="text-white/20 text-xs">{user.email}</p>
            </div>
          </div>
        </div>

        {/* My Characters */}
        <div className="mb-6">
          <h3 className="text-white/20 text-[10px] uppercase tracking-wider px-2 mb-3">我的角色</h3>
          <div className="space-y-2">
            {userCharacters.length === 0 ? (
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-white/15 text-xs">还没有建立关系的角色</p>
                <Link href="/characters" className="text-white/30 text-xs mt-2 inline-block hover:text-white/50">
                  去选择 →
                </Link>
              </div>
            ) : (
              userCharacters.map((uc) => (
                <Link
                  key={uc.id}
                  href={`/chat/${uc.character.id}`}
                  className="glass-card rounded-xl p-3.5 flex items-center gap-3 group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${uc.character.themeColor}10` }}
                  >
                    <MessageCircle className="w-4 h-4" style={{ color: `${uc.character.themeColor}60` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white/60 text-sm">{uc.character.name}</h4>
                    <p className="text-white/15 text-[11px]">{uc.character.occupation}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/25 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <h3 className="text-white/20 text-[10px] uppercase tracking-wider px-2 mb-3">账户</h3>
          <div className="glass-card rounded-xl divide-y divide-white/[0.03]">
            <Link href="/characters" className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
              <span className="text-white/40 text-sm">选择新角色</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/10" />
            </Link>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-white/15 hover:text-white/30 text-sm transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          退出登录
        </button>
      </main>
    </div>
  )
}
