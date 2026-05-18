"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface R2ImageProps {
  src: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

/**
 * R2 图片组件
 * 自动处理 R2 私有 bucket 的预签名 URL 获取
 */
export function R2Image({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes,
}: R2ImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(src)
  const [isLoading, setIsLoading] = useState(src ? true : false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!src) {
      return
    }

    // 检查是否是 R2 URL
    if (src.includes("r2.cloudflarestorage.com")) {
      // 获取预签名 URL
      fetch(`/api/images?url=${encodeURIComponent(src)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setImageUrl(data.url)
          }
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => setIsLoading(false), 0)
        })
        .catch((err) => {
          console.error("Failed to get signed URL:", err)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => setIsLoading(false), 0)
        })
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setIsLoading(false), 0)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [src])

  if (!imageUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">{alt}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`bg-muted animate-pulse ${className}`} />
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized={imageUrl.includes("r2.cloudflarestorage.com")}
    />
  )
}
