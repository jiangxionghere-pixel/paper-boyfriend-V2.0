"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Loader2, User, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { TTSPlayer } from "./tts-player"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  imageUrl: string | null
  audioUrl?: string | null
  createdAt: string
}

interface ChatUIProps {
  characterId: string
  userCharacterId: string
  initialMessages: ChatMessage[]
  themeColor: string
  userAvatarUrl?: string | null
  characterAvatarUrl?: string | null
  initialTtsEnabled?: boolean
  initialTtsMuted?: boolean
}

export function ChatUI({
  characterId,
  userCharacterId,
  initialMessages,
  themeColor,
  userAvatarUrl,
  characterAvatarUrl,
  initialTtsEnabled = true,
  initialTtsMuted = false,
}: ChatUIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [ttsMuted, setTtsMuted] = useState(initialTtsMuted)
  const [isTogglingTts, setIsTogglingTts] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    inputRef.current?.focus()
  }, [isLoading])

  const toggleTtsMute = async () => {
    if (isTogglingTts) return
    setIsTogglingTts(true)
    const newValue = !ttsMuted
    try {
      const res = await fetch("/api/user/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCharacterId, ttsMuted: newValue }),
      })
      if (res.ok) setTtsMuted(newValue)
    } catch (error) {
      console.error("TTS mute toggle error:", error)
    } finally {
      setIsTogglingTts(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    setInput("")
    setIsLoading(true)

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      imageUrl: null,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const res = await fetch(`/api/chat/${characterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userCharacterId }),
      })

      if (!res.ok) throw new Error("Chat request failed")

      const data = await res.json()
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))

      const assistantMsg: ChatMessage = {
        id: data.messageId || `msg-${Date.now()}`,
        role: "assistant",
        content: data.content,
        imageUrl: data.imageUrl || null,
        audioUrl: data.audioUrl || null,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [
        ...prev,
        { ...userMsg, id: data.userMessageId || userMsg.id },
        assistantMsg,
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMsg.id),
        { ...userMsg, id: `err-${Date.now()}` },
        {
          id: `err-assistant-${Date.now()}`,
          role: "assistant",
          content: "抱歉，我这边网络好像有点问题...等一下再试试？",
          imageUrl: null,
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative z-10">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}12` }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ backgroundColor: `${themeColor}50` }} />
              </div>
              <p className="text-white/15 text-sm">发送第一条消息吧</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {/* Assistant Avatar */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/[0.03] mt-1">
                  {characterAvatarUrl ? (
                    <Image src={characterAvatarUrl} alt="" width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white/15" />
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="flex flex-col max-w-[75%]">
                <div
                  className={cn(
                    "relative px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-white/[0.06] text-white/80 rounded-2xl rounded-tr-sm"
                      : "bg-white/[0.03] text-white/70 rounded-2xl rounded-tl-sm border border-white/[0.04]"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                  {msg.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img src={msg.imageUrl} alt="" className="w-full max-w-[200px] object-cover" loading="lazy" />
                    </div>
                  )}

                  {msg.role === "assistant" && msg.audioUrl && (
                    <div className="mt-2">
                      <TTSPlayer audioUrl={msg.audioUrl} themeColor={themeColor} autoPlay={false} isMuted={ttsMuted} />
                    </div>
                  )}
                </div>

                <span className={cn("text-[10px] text-white/15 mt-1", msg.role === "user" ? "text-right" : "text-left")}>
                  {new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/[0.03] mt-1">
                  {userAvatarUrl ? (
                    <Image src={userAvatarUrl} alt="" width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white/15" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTtsMute}
              disabled={isTogglingTts}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: ttsMuted ? "rgba(255,255,255,0.03)" : `${themeColor}10`,
                color: ttsMuted ? "rgba(255,255,255,0.2)" : `${themeColor}80`,
              }}
            >
              {ttsMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="说点什么..."
              disabled={isLoading}
              className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/[0.1] transition-colors disabled:opacity-40"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-20"
              style={{
                backgroundColor: input.trim() ? `${themeColor}20` : "rgba(255,255,255,0.03)",
                color: input.trim() ? `${themeColor}cc` : "rgba(255,255,255,0.2)",
              }}
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
