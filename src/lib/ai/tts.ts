const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""
const TTS_ACCESS_KEY = process.env.TTS_ACCESS_KEY || ""
const TTS_SECRET_KEY = process.env.TTS_SECRET_KEY || ""

/**
 * Doubao-语音合成-2.0 (火山引擎)
 * 文档: https://www.volcengine.com/docs/6561/1719100
 *
 * 使用 WebSocket 长连接方式接入
 * 简化版本：使用 HTTP POST 方式（如果支持）
 *
 * 由于火山引擎 TTS 主要使用 WebSocket，这里提供一个适配层
 * 如果需要完整 WebSocket 实现，需要额外开发
 */

export async function textToSpeech(
  text: string,
  voiceId?: string
): Promise<string | null> {
  if (!TTS_API_KEY) {
    console.log("[TTS] API key not configured, skipping")
    return null
  }

  try {
    // 火山引擎 TTS HTTP API (如果可用)
    // 或者使用 OpenAI 兼容接口
    const response = await fetch(
      "https://openspeech.bytedance.com/api/v1/tts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TTS_API_KEY}`,
        },
        body: JSON.stringify({
          app: {
            appid: TTS_APP_ID,
            token: "access_token",
            cluster: "volcano_tts",
          },
          user: {
            uid: "paper-boyfriend-user",
          },
          audio: {
            voice_type: voiceId || "BV001_streaming",
            encoding: "mp3",
            speed_ratio: 1.0,
            volume_ratio: 1.0,
            pitch_ratio: 1.0,
          },
          request: {
            reqid: `tts-${Date.now()}`,
            text: text.slice(0, 500),
            operation: "query",
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[TTS] API error (${response.status}): ${errorText}`)
      return null
    }

    const result = await response.json()

    // 如果返回的是 base64 音频数据
    if (result.data && result.data.audio) {
      const audioBuffer = Buffer.from(result.data.audio, "base64")
      const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" })

      // Upload to Vercel Blob
      const { put } = await import("@vercel/blob")
      const { url } = await put(
        `tts/${Date.now()}-${voiceId || "default"}.mp3`,
        audioBlob,
        {
          access: "public",
        }
      )

      return url
    }

    console.log("[TTS] No audio data in response")
    return null
  } catch (error) {
    console.error("[TTS] Generation failed:", error)
    return null
  }
}
