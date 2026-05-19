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
  const [ttsEnabled, setTtsEnabled] = useState(initialTtsEnabled)
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

  // Toggle TTS mute (只控制播放，不影响生成)
  const toggleTtsMute = async () => {
    if (isTogglingTts) return
    setIsTogglingTts(true)

    const newValue = !ttsMuted
    try {
      const res = await fetch("/api/user/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCharacterId,
          ttsMuted: newValue,
        }),
      })

      if (res.ok) {
        setTtsMuted(newValue)
      } else {
        console.error("Failed to toggle TTS mute")
      }
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

      if (!res.ok) {
        throw new Error("Chat request failed")
      }

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
        {
          ...userMsg,
          id: `err-${Date.now()}`,
        },
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
    <div className="flex-1 flex flex-col min-h-0 relative z-10 bg-[#0a0a0a]">
      {/* Messages Area - 微信风格 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-24 animate-fade-in">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}10`, border: `1px solid ${themeColor}15` }}
              >
                <div className="w-3 h-3 rounded-full animate-gentle-pulse" style={{ backgroundColor: `${themeColor}60` }} />
              </div>
              <p className="text-white/20 text-sm mb-2">发送第一条消息吧</p>
              <p className="text-white/10 text-xs">他会认真回应你的每一句话</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {/* Avatar for assistant - 微信左侧 */}
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 shadow-sm">
                  {characterAvatarUrl ? (
                    <Image
                      src={characterAvatarUrl}
                      alt="Character"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white/20" />
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble - 微信风格 */}
              <div className="flex flex-col max-w-[70%]">
                <div
                  className={cn(
                    "relative px-4 py-2.5 text-[15px] leading-relaxed",
                    msg.role === "user" 
                      ? "bg-[#95ec69] text-[#1a1a1a] rounded-2xl rounded-tr-sm" 
                      : "bg-[#262626] text-white/90 rounded-2xl rounded-tl-sm"
                  )}
                >
                  {/* 微信气泡小三角 */}
                  <span 
                    className={cn(
                      "absolute top-3 w-2 h-2",
                      msg.role === "user" 
                        ? "-right-1 bg-[#95ec69] rotate-45" 
                        : "-left-1 bg-[#262626] rotate-45"
                    )}
                  />
                  
                  <p className="whitespace-pre-wrap break-words relative z-10">
                    {msg.content}
                  </p>

                  {/* Image */}
                  {msg.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img
                        src={msg.imageUrl}
                        alt="照片"
                        className="w-full max-w-[240px] object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* TTS Player - 嵌入在气泡内，每条消息独立控制 */}
                  {msg.role === "assistant" && msg.audioUrl && (
                    <div className="mt-2 relative z-10">
                      <TTSPlayer 
                        audioUrl={msg.audioUrl} 
                        themeColor={themeColor}
                        autoPlay={false}
                        isMuted={ttsMuted}
                      />
                    </div>
                  )}
                </div>

                {/* Timestamp - 微信风格 */}
                <span 
                  className={cn(
                    "text-[10px] text-white/25 mt-1",
                    msg.role === "user" ? "text-right" : "text-left"
                  )}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Avatar for user - 微信右侧 */}
              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 shadow-sm">
                  {userAvatarUrl ? (
                    <Image
                      src={userAvatarUrl}
                      alt="User"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white/20" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - 微信风格底部输入栏 */}
      <div className="shrink-0 px-4 py-3 bg-[#111] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            {/* 静音按钮 */}
            <button
              type="button"
              onClick={toggleTtsMute}
              disabled={isTogglingTts}
              className="shrink-0 p-2.5 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-30"
              style={{
                backgroundColor: ttsMuted ? "rgba(255,255,255,0.05)" : `${themeColor}15`,
                color: ttsMuted ? "rgba(255,255,255,0.3)" : `${themeColor}cc`,
              }}
              title={ttsMuted ? "点击开启语音" : "点击静音"}
            >
              {ttsMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="说点什么..."
              disabled={isLoading}
              className="flex-1 bg-[#1a1a1a] border-0 rounded-lg px-4 py-2.5 text-[15px] text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
              style={{
                backgroundColor: input.trim() ? themeColor : "rgba(255,255,255,0.1)",
                color: input.trim() ? "#fff" : "rgba(255,255,255,0.3)",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "发送"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
