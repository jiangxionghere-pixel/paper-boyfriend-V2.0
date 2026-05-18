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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarUrl(data.avatarUrl)
        router.refresh()
      } else {
        alert("上传失败，请重试")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("上传失败，请重试")
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
    <div className="relative min-h-screen">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-300/4 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 px-6 py-6 flex items-center max-w-2xl mx-auto">
        <Link href="/characters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </Link>
        <div className="flex-1 text-center">
          <span className="text-white/30 text-xs tracking-widest uppercase">设置</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="relative z-10 px-6 pb-32 max-w-2xl mx-auto animate-fade-in-up">
        <div className="glass rounded-3xl p-8 mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar Upload */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="relative w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden group hover:bg-white/10 transition-colors"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white/20" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white/80" />
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div>
              <h2 className="text-white/80 font-medium text-lg">
                {user.name || "未设置昵称"}
              </h2>
              <p className="text-white/20 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-white/30 text-xs uppercase tracking-widest px-2 mb-3">我的角色</h3>
          <div className="space-y-3">
            {userCharacters.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center">
                <p className="text-white/20 text-sm">还没有建立关系的角色</p>
                <Link href="/characters" className="text-white/40 text-sm mt-2 inline-block hover:text-white/60">
                  去选择 →
                </Link>
              </div>
            ) : (
              userCharacters.map((uc) => (
                <Link
                  key={uc.id}
                  href={`/chat/${uc.character.id}`}
                  className="glass rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.06] transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${uc.character.themeColor}15` }}
                  >
                    <MessageCircle className="w-5 h-5" style={{ color: `${uc.character.themeColor}80` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white/70 font-medium text-sm">{uc.character.name}</h4>
                    <p className="text-white/15 text-xs truncate">{uc.character.occupation}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-white/30 text-xs uppercase tracking-widest px-2 mb-3">账户</h3>
          <div className="glass rounded-2xl divide-y divide-white/[0.03]">
            <Link
              href="/characters"
              className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-white/50 text-sm">选择新角色</span>
              <ChevronRight className="w-4 h-4 text-white/10" />
            </Link>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full text-white/20 hover:text-white/40 justify-center gap-2 rounded-2xl py-3"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </Button>
      </main>
    </div>
  )
}
