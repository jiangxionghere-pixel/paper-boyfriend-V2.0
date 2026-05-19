const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

/**
 * 豆包语音合成模型 - 单向流式 HTTP V3 API
 * 文档: https://www.volcengine.com/docs/6561/1329505
 */

// 1.0 -> 2.0 音色映射表
const VOICE_ID_MAP: Record<string, string> = {
  "zh_male_mars_bigtts": "zh_male_m191_uranus_bigtts",
  "zh_male_yangguangqingnian_emo_v2_mars_bigtts": "zh_male_m191_uranus_bigtts",
  "zh_female_mars_bigtts": "zh_female_vv_uranus_bigtts",
}

function resolveVoiceId(voiceId?: string): string {
  if (!voiceId) return "zh_male_m191_uranus_bigtts"
  if (voiceId.includes("_uranus_bigtts")) return voiceId
  if (VOICE_ID_MAP[voiceId]) return VOICE_ID_MAP[voiceId]
  if (voiceId.includes("_mars_bigtts")) {
    return voiceId.replace("_mars_bigtts", "_uranus_bigtts")
  }
  return voiceId
}

export async function textToSpeech(
  text: string,
  voiceId?: string
): Promise<string | null> {
  process.stderr.write(`[TTS] Checking config: hasApiKey=${!!TTS_API_KEY}, hasAppId=${!!TTS_APP_ID}\n`)

  if (!TTS_API_KEY || !TTS_APP_ID) {
    process.stderr.write("[TTS] API key or App ID not configured\n")
    return null
  }

  const resolvedVoiceId = resolveVoiceId(voiceId)
  process.stderr.write(`[TTS] Generating speech with voice: ${resolvedVoiceId}\n`)

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
          user: { uid: "paper-boyfriend-user" },
          req_params: {
            text: text.slice(0, 500),
            speaker: resolvedVoiceId,
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
      process.stderr.write(`[TTS] API error (${response.status}): ${errorText}\n`)
      return null
    }

    // 读取所有响应数据
    const responseText = await response.text()
    process.stderr.write(`[TTS] Response length: ${responseText.length}\n`)

    // 解析所有 JSON 行，提取音频数据
    let audioBase64 = ""
    const lines = responseText.split("\n").filter(line => line.trim())

    for (const line of lines) {
      try {
        const data = JSON.parse(line)

        // 检查错误码
        if (data.code !== undefined && data.code !== 0 && data.code !== 20000000) {
          process.stderr.write(`[TTS] Business error [${data.code}]: ${data.message}\n`)
          return null
        }

        // 提取音频数据 - 火山引擎返回的 base64 以 //OEx 开头
        if (data.data && typeof data.data === "string" && data.data.startsWith("//OEx")) {
          audioBase64 += data.data
        }
      } catch {
        // 非 JSON 行，忽略
      }
    }

    process.stderr.write(`[TTS] Audio data length: ${audioBase64.length}\n`)

    if (!audioBase64) {
      process.stderr.write("[TTS] No audio data found\n")
      return null
    }

    // 解码并验证
    const audioBuffer = Buffer.from(audioBase64, "base64")
    process.stderr.write(`[TTS] Decoded buffer size: ${audioBuffer.length}\n`)

    // 验证 MP3 头
    const isValidMp3 = audioBuffer.length > 10 && (
      (audioBuffer[0] === 0x49 && audioBuffer[1] === 0x44 && audioBuffer[2] === 0x33) ||
      (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0)
    )

    if (!isValidMp3) {
      process.stderr.write(`[TTS] Invalid MP3 header: ${audioBuffer.slice(0, 4).toString('hex')}\n`)
      return null
    }

    // 上传到 Vercel Blob
    const { put } = await import("@vercel/blob")
    const { url } = await put(
      `tts/${Date.now()}.mp3`,
      new Blob([audioBuffer], { type: "audio/mp3" }),
      { access: "public", contentType: "audio/mp3" }
    )

    process.stderr.write(`[TTS] Success: ${url}\n`)
    return url
  } catch (error) {
    process.stderr.write(`[TTS] Error: ${error}\n`)
    return null
  }
}
