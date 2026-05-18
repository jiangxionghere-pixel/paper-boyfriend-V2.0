"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Loader2, User } from "lucide-react"
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
}

export function ChatUI({ characterId, userCharacterId, initialMessages, themeColor, userAvatarUrl, characterAvatarUrl }: ChatUIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
    <div className="flex-1 flex flex-col min-h-0 relative z-10">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto chat-scrollbar px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
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
                "flex animate-fade-in-up gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              {/* Avatar for assistant */}
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/5">
                  {characterAvatarUrl ? (
                    <Image
                      src={characterAvatarUrl}
                      alt="Character"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                </div>
              )}

              <div
                className={cn(
                  "max-w-[75%]",
                  msg.role === "user" ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"
                )}
                style={
                  msg.role === "user"
                    ? {
                        background: `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}10 100%)`,
                        border: `1px solid ${themeColor}15`,
                        backdropFilter: "blur(12px)",
                        padding: "14px 18px",
                      }
                    : {
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        padding: "14px 18px",
                      }
                }
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ color: msg.role === "user" ? "rgba(255,255,255,0.85)" : "rgba(245,240,235,0.75)" }}>
                  {msg.content}
                </p>

                {/* Image */}
                {msg.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/[0.06] image-hover-zoom">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.imageUrl}
                      alt="照片"
                      className="w-full max-w-[300px] object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* TTS Player */}
                {msg.role === "assistant" && msg.audioUrl && (
                  <TTSPlayer audioUrl={msg.audioUrl} themeColor={themeColor} />
                )}

                {/* Timestamp */}
                <p className="text-[10px] mt-2 text-white/15">
                  {new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* Avatar for user */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/5">
                  {userAvatarUrl ? (
                    <Image
                      src={userAvatarUrl}
                      alt="User"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white/20" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div
                className="rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full typing-dot"
                    style={{ backgroundColor: `${themeColor}60` }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full typing-dot"
                    style={{ backgroundColor: `${themeColor}60` }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full typing-dot"
                    style={{ backgroundColor: `${themeColor}60` }}
                  />
                </div>
                <span className="text-white/15 text-xs">输入中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex items-center gap-2"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            borderRadius: "1.25rem",
            border: `1px solid ${themeColor}10`,
            padding: "0.375rem",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = `${themeColor}25`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = `${themeColor}10`
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none disabled:opacity-50"
            style={{ color: "rgba(255,255,255,0.7)", caretColor: `${themeColor}80` }}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-20"
            style={{
              backgroundColor: input.trim() ? `${themeColor}25` : "transparent",
              border: input.trim() ? `1px solid ${themeColor}30` : "1px solid transparent",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: `${themeColor}80` }} />
            ) : (
              <Send className="w-4 h-4" style={{ color: input.trim() ? `${themeColor}cc` : "rgba(255,255,255,0.3)" }} />
            )}
          </button>
        </form>

        {/* Input hint */}
        <p className="text-center mt-2 text-white/10 text-[10px] tracking-wider">
          他会记住你们的对话，关系会随着相处自然演进
        </p>
      </div>
    </div>
  )
}
