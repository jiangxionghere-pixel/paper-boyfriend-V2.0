const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

/**
 * 豆包语音合成模型 2.0 - 单向流式 HTTP V3 API
 * 文档: https://www.volcengine.com/docs/6561/1329505
 *
 * 请求路径: https://openspeech.bytedance.com/api/v3/tts/unidirectional
 * 资源ID: seed-tts-2.0 (豆包语音合成模型2.0 字符版)
 */

export async function textToSpeech(
  text: string,
  voiceId?: string
): Promise<string | null> {
  console.log("[TTS] Checking config:", { 
    hasApiKey: !!TTS_API_KEY, 
    hasAppId: !!TTS_APP_ID,
    apiKeyLength: TTS_API_KEY?.length,
    appId: TTS_APP_ID
  })
  
  if (!TTS_API_KEY || !TTS_APP_ID) {
    console.log("[TTS] API key or App ID not configured, skipping")
    return null
  }

  try {
    console.log(`[TTS] Generating speech with voice: ${voiceId || "default"}`)
    
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
            speaker: voiceId || "zh_male_m191_uranus_bigtts",
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

    let audioBase64 = ""
    let chunkCount = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunkText = new TextDecoder().decode(value)

      // 解析 JSON 行，提取音频数据
      const lines = chunkText.split("\n").filter((line) => line.trim())
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          // 检查业务错误码 (code 0 表示成功，20000000 表示结束)
          if (data.code !== undefined && data.code !== 0 && data.code !== 20000000) {
            console.error(`[TTS] Business error [${data.code}]: ${data.message}`)
            return null
          }
          // 音频数据在 data 字段直接存放 (base64)
          if (data.data && typeof data.data === "string") {
            audioBase64 += data.data
          }
          // 也可能在 data.audio 中
          if (data.data?.audio) {
            audioBase64 += data.data.audio
          }
        } catch {
          // 非 JSON 行，忽略
        }
      }
    }

    console.log(`[TTS] Received ${chunkCount} chunks, audio length: ${audioBase64.length}`)

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
      `tts/${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`,
      audioBlob,
      {
        access: "public",
        contentType: "audio/mp3",
      }
    )

    console.log(`[TTS] Audio uploaded: ${url}`)
    return url
  } catch (error) {
    console.error("[TTS] Generation failed:", error)
    return null
  }
}
