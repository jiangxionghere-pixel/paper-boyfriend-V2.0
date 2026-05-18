"use client"

import Script from "next/script"
import { useCallback, useEffect, useRef, useState } from "react"

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
          size?: "normal" | "compact"
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string>("")

  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !widgetRef.current || !sitekey) return

    // 如果已存在，先移除
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
    }

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey,
      callback: (token: string) => {
        onVerify(token)
      },
      "error-callback": () => {
        onError?.()
      },
      "expired-callback": () => {
        onExpire?.()
      },
      theme: "dark",
      size: "normal",
    })
  }, [sitekey, onVerify, onError, onExpire])

  useEffect(() => {
    if (isLoaded) {
      renderWidget()
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [isLoaded, renderWidget])

  if (!sitekey) {
    console.warn("[Turnstile] Site key not configured")
    return null
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={() => setIsLoaded(true)}
        strategy="afterInteractive"
      />
      <div ref={widgetRef} className="flex justify-center" />
    </>
  )
}
