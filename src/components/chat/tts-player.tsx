"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface TTSPlayerProps {
  audioUrl: string | null
  themeColor: string
  autoPlay?: boolean
  isMuted?: boolean
}

export function TTSPlayer({ 
  audioUrl, 
  themeColor, 
  autoPlay = false,
  isMuted = false
}: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 预加载音频
  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audio.preload = "auto"
    
    const handleCanPlay = () => {
      setIsLoaded(true)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100
        setProgress(pct)
      }
    }

    const handleError = () => {
      console.error("[TTS] Audio load error")
      setIsLoaded(false)
    }

    audio.addEventListener("canplaythrough", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("error", handleError)
    
    audioRef.current = audio
    audio.load()

    return () => {
      audio.pause()
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("error", handleError)
      audio.src = ""
    }
  }, [audioUrl])

  // 自动播放控制（仅当未被静音时）
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isLoaded) return

    if (autoPlay && !isMuted && !isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }, [autoPlay, isMuted, isLoaded])

  const handleToggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !isLoaded) return

    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      setProgress(0)
    } else {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }, [isPlaying, isLoaded])

  if (!audioUrl) return null

  return (
    <div className="flex items-center gap-2">
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
      
      {/* 进度条 */}
      {isPlaying && (
        <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-100"
            style={{ 
              width: `${progress}%`,
              backgroundColor: themeColor 
            }}
          />
        </div>
      )}
    </div>
  )
}
