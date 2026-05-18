const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

/**
 * 豆包语音合成模型 2.0 - 单向流式 HTTP V3 API
 * 文档: https://www.volcengine.com/docs/6561/1329505
 *
 * 请求路径: https://openspeech.bytedance.com/api/v3/tts/unidirectional
 * 资源ID: seed-tts-2.0 (豆包语音合成模型2.0)
 */

export async function textToSpeech(
  text: string,
  voiceId?: string
): Promise<string | null> {
  if (!TTS_API_KEY || !TTS_APP_ID) {
    console.log("[TTS] API key or App ID not configured, skipping")
    return null
  }

  try {
    const response = await fetch(
      "https://openspeech.bytedance.com/api/v3/tts/unidirectional",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-App-Id": TTS_APP_ID,
          "X-Api-Access-Key": TTS_API_KEY,
          "X-Api-Resource-Id": "seed-tts-2.0",
        },
        body: JSON.stringify({
          user: {
            uid: "paper-boyfriend-user",
          },
          req_params: {
            text: text.slice(0, 500),
            speaker: voiceId || "zh_male_xiaoming_seed_tts_v2",
            audio_params: {
              format: "mp3",
              sample_rate: 24000,
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[TTS] API error (${response.status}): ${errorText}`)
      return null
    }

    // 流式响应：读取所有 chunk 并提取音频数据
    const reader = response.body?.getReader()
    if (!reader) {
      console.error("[TTS] No response body")
      return null
    }

    const chunks: Uint8Array[] = []
    let audioBase64 = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 将 Uint8Array 转换为字符串
      const chunkText = new TextDecoder().decode(value)

      // 解析 JSON 行，提取音频数据
      const lines = chunkText.split("\n").filter((line) => line.trim())
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.data?.audio) {
            audioBase64 += data.data.audio
          }
          if (data.data?.usage) {
            console.log("[TTS] Usage:", data.data.usage)
          }
        } catch {
          // 非 JSON 行，忽略
        }
      }
    }

    if (!audioBase64) {
      console.log("[TTS] No audio data in response")
      return null
    }

    // 解码 base64 音频数据
    const audioBuffer = Buffer.from(audioBase64, "base64")
    const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" })

    // 上传到 Vercel Blob
    const { put } = await import("@vercel/blob")
    const { url } = await put(
      `tts/${Date.now()}-${voiceId || "default"}.mp3`,
      audioBlob,
      {
        access: "public",
      }
    )

    console.log(`[TTS] Generated audio: ${url}`)
    return url
  } catch (error) {
    console.error("[TTS] Generation failed:", error)
    return null
  }
}
