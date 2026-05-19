"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface TTSPlayerProps {
  audioUrl: string | null
  themeColor: string
  autoPlay?: boolean
  onToggle?: () => void
  isMuted?: boolean
}

export function TTSPlayer({ 
  audioUrl, 
  themeColor, 
  autoPlay = true,
  onToggle,
  isMuted = false
}: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.addEventListener("canplaythrough", () => {
        setIsLoaded(true)
        // 自动播放（如果未静音）
        if (autoPlay && !isMuted) {
          audio.play().catch((err) => {
            console.error("[TTS] Auto-play failed:", err)
            setIsPlaying(false)
          })
          setIsPlaying(true)
        }
      })
      audio.addEventListener("ended", () => setIsPlaying(false))
      audio.addEventListener("error", () => setIsLoaded(false))
      audioRef.current = audio

      return () => {
        audio.pause()
        audio.removeEventListener("canplaythrough", () => {})
        audio.removeEventListener("ended", () => {})
        audio.removeEventListener("error", () => {})
      }
    }
  }, [audioUrl, autoPlay, isMuted])

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
      return
    }

    if (!audioRef.current || !isLoaded) return

    if (isPlaying) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => {
        console.error("[TTS] Play failed:", err)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  if (!audioUrl) return null

  return (
    <button
      onClick={handleToggle}
      disabled={!isLoaded}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all duration-200 hover:scale-105 disabled:opacity-30"
      style={{
        backgroundColor: isMuted ? "rgba(255,255,255,0.05)" : `${themeColor}15`,
        color: isMuted ? "rgba(255,255,255,0.3)" : `${themeColor}cc`,
        border: `1px solid ${isMuted ? "rgba(255,255,255,0.08)" : `${themeColor}20`}`,
      }}
    >
      {isMuted ? (
        <VolumeX className="w-3 h-3" />
      ) : isPlaying ? (
        <span className="flex items-center gap-0.5">
          <span 
            className="w-[2px] h-2.5 rounded-full animate-pulse" 
            style={{ backgroundColor: themeColor, animationDelay: "0ms" }}
          />
          <span 
            className="w-[2px] h-3 rounded-full animate-pulse" 
            style={{ backgroundColor: themeColor, animationDelay: "150ms" }}
          />
          <span 
            className="w-[2px] h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: themeColor, animationDelay: "300ms" }}
          />
        </span>
      ) : (
        <Volume2 className="w-3 h-3" />
      )}
      <span>{isMuted ? "已静音" : isPlaying ? "播放中" : "听语音"}</span>
    </button>
  )
}
