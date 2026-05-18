"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2 } from "lucide-react"

interface TTSPlayerProps {
  audioUrl: string | null
  themeColor: string
}

export function TTSPlayer({ audioUrl, themeColor }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.addEventListener("canplaythrough", () => setIsLoaded(true))
      audio.addEventListener("ended", () => setIsPlaying(false))
      audio.addEventListener("error", () => setIsLoaded(false))
      audioRef.current = audio

      return () => {
        audio.pause()
        audio.removeEventListener("canplaythrough", () => setIsLoaded(true))
        audio.removeEventListener("ended", () => setIsPlaying(false))
        audio.removeEventListener("error", () => setIsLoaded(false))
      }
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return

    if (isPlaying) {
      audioRef.current.pause()
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
      onClick={togglePlay}
      disabled={!isLoaded}
      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:scale-105 disabled:opacity-30"
      style={{
        backgroundColor: `${themeColor}15`,
        color: `${themeColor}cc`,
        border: `1px solid ${themeColor}20`,
      }}
    >
      {isPlaying ? (
        <Pause className="w-3 h-3" />
      ) : (
        <Play className="w-3 h-3" />
      )}
      <span>{isPlaying ? "播放中" : "听语音"}</span>
      <Volume2 className="w-3 h-3 ml-0.5" />
    </button>
  )
}
