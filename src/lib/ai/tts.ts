const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

/**
 * 豆包语音合成模型 - 单向流式 HTTP V3 API
 * 文档: https://www.volcengine.com/docs/6561/1329505
 *
 * 请求路径: https://openspeech.bytedance.com/api/v3/tts/unidirectional
 * 资源ID: seed-tts-2.0 (与 speaker 音色ID匹配)
 *
 * 音色ID映射规则：
 * - seed-tts-1.0 音色后缀: _mars_bigtts
 * - seed-tts-2.0 音色后缀: _uranus_bigtts
 * - 如果传入 1.0 音色，自动转换为对应的 2.0 音色
 */

// 1.0 -> 2.0 音色映射表
const VOICE_ID_MAP: Record<string, string> = {
  // 1.0 音色 -> 2.0 音色
  "zh_male_mars_bigtts": "zh_male_m191_uranus_bigtts",
  "zh_male_yangguangqingnian_emo_v2_mars_bigtts": "zh_male_m191_uranus_bigtts",
  "zh_female_mars_bigtts": "zh_female_vv_uranus_bigtts",
}

function resolveVoiceId(voiceId?: string): string {
  if (!voiceId) return "zh_male_m191_uranus_bigtts"

  // 如果已经是 2.0 音色，直接使用
  if (voiceId.includes("_uranus_bigtts")) {
    return voiceId
  }

  // 如果在映射表中，转换
  if (VOICE_ID_MAP[voiceId]) {
    process.stderr.write(`[TTS] Voice ID mapped: ${voiceId} -> ${VOICE_ID_MAP[voiceId]}\n`)
    return VOICE_ID_MAP[voiceId]
  }

  // 如果是 1.0 音色但不在映射表中，尝试自动替换后缀
  if (voiceId.includes("_mars_bigtts")) {
    const mapped = voiceId.replace("_mars_bigtts", "_uranus_bigtts")
    process.stderr.write(`[TTS] Voice ID auto-mapped: ${voiceId} -> ${mapped}\n`)
    return mapped
  }

  return voiceId
}

export async function textToSpeech(
  text: string,
  voiceId?: string
): Promise<string | null> {
  // 使用 stderr 确保日志在 Vercel 中可见
  process.stderr.write(`[TTS] Checking config: hasApiKey=${!!TTS_API_KEY}, hasAppId=${!!TTS_APP_ID}, apiKeyLength=${TTS_API_KEY?.length || 0}\n`)

  if (!TTS_API_KEY || !TTS_APP_ID) {
    process.stderr.write("[TTS] API key or App ID not configured, skipping\n")
    return null
  }

  // 解析并转换音色ID
  const resolvedVoiceId = resolveVoiceId(voiceId)

  try {
    process.stderr.write(`[TTS] Generating speech with voice: ${resolvedVoiceId}\n`)

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

    // 流式响应：读取所有 chunk 并提取音频数据
    const reader = response.body?.getReader()
    if (!reader) {
      process.stderr.write("[TTS] No response body\n")
      return null
    }

    let audioBase64 = ""
    let chunkCount = 0
    let buffer = "" // 用于缓存不完整的 JSON

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunkText = new TextDecoder().decode(value)

      // 将新数据追加到缓冲区
      buffer += chunkText

      // 尝试提取完整的 JSON 对象
      while (true) {
        // 查找完整的 JSON 对象（以 { 开头，以 } 结尾）
        const startIdx = buffer.indexOf("{")
        if (startIdx === -1) {
          // 没有 {，清空缓冲区（除非是音频数据）
          if (!buffer.startsWith("//OEx")) {
            buffer = ""
          }
          break
        }

        // 查找匹配的 }
        let braceCount = 0
        let endIdx = -1
        for (let i = startIdx; i < buffer.length; i++) {
          if (buffer[i] === "{") braceCount++
          else if (buffer[i] === "}") braceCount--

          if (braceCount === 0) {
            endIdx = i
            break
          }
        }

        if (endIdx === -1) {
          // 没有找到完整的 JSON，保留缓冲区等待下一个 chunk
          break
        }

        // 提取完整的 JSON 字符串
        const jsonStr = buffer.slice(startIdx, endIdx + 1)
        buffer = buffer.slice(endIdx + 1)

        try {
          const data = JSON.parse(jsonStr)

          // 检查业务错误码 (code 0 表示成功，20000000 表示结束)
          if (data.code !== undefined && data.code !== 0 && data.code !== 20000000) {
            process.stderr.write(`[TTS] Business error [${data.code}]: ${data.message}\n`)
            return null
          }

          // 提取音频数据
          if (data.data && typeof data.data === "string" && data.data.startsWith("//OEx")) {
            audioBase64 += data.data
          }
        } catch {
          // JSON 解析失败，可能是音频数据片段
        }
      }

      // 处理缓冲区中剩余的音频数据（非 JSON 的 //OEx 片段）
      if (buffer.includes("//OEx")) {
        // 手动移除 JSON 对象，保留音频数据
        let cleaned = buffer
        while (true) {
          const startIdx = cleaned.indexOf("{")
          if (startIdx === -1) break

          let braceCount = 0
          let endIdx = -1
          for (let i = startIdx; i < cleaned.length; i++) {
            if (cleaned[i] === "{") braceCount++
            else if (cleaned[i] === "}") braceCount--

            if (braceCount === 0) {
              endIdx = i
              break
            }
          }

          if (endIdx === -1) break
          cleaned = cleaned.slice(0, startIdx) + cleaned.slice(endIdx + 1)
        }

        if (cleaned.startsWith("//OEx")) {
          audioBase64 += cleaned
        }
        buffer = ""
      }
    }

    process.stderr.write(`[TTS] Received ${chunkCount} chunks, audio length: ${audioBase64.length}\n`)

    if (!audioBase64) {
      process.stderr.write("[TTS] No audio data in response\n")
      return null
    }

    // 解码 base64 音频数据
    const audioBuffer = Buffer.from(audioBase64, "base64")

    // 验证音频数据完整性（MP3 文件以 ID3 或 0xFFE 开头）
    const isValidMp3 = audioBuffer.length > 10 && (
      audioBuffer[0] === 0x49 && audioBuffer[1] === 0x44 && audioBuffer[2] === 0x33 || // ID3
      audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0 // MPEG sync
    )

    if (!isValidMp3) {
      process.stderr.write(`[TTS] Invalid MP3 data, first bytes: ${audioBuffer.slice(0, 4).toString('hex')}\n`)
      return null
    }

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

    process.stderr.write(`[TTS] Audio uploaded: ${url} (${audioBuffer.length} bytes)\n`)
    return url
  } catch (error) {
    process.stderr.write(`[TTS] Generation failed: ${error}\n`)
    return null
  }
}
