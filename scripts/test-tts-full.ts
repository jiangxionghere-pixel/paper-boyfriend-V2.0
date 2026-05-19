/**
 * TTS 完整测试 - 生成音频并保存到本地
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

// 模拟主代码的解析逻辑
async function testTTS() {
  console.log("🔍 TTS 完整测试")
  console.log("=" .repeat(60))

  const testText = "你好，我是纸片人男友，很高兴认识你。今天过得怎么样？"
  const voiceId = "zh_male_m191_uranus_bigtts"

  console.log(`📝 测试文本: ${testText}`)
  console.log(`🎙️  音色: ${voiceId}`)
  console.log("")

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
          user: { uid: "test-user" },
          req_params: {
            text: testText,
            speaker: voiceId,
            audio_params: { format: "mp3", sample_rate: 24000 },
          },
        }),
      }
    )

    console.log(`📡 HTTP 状态: ${response.status}`)

    const reader = response.body?.getReader()
    if (!reader) {
      console.log("❌ 无响应体")
      return
    }

    let audioBase64 = ""
    let chunkCount = 0
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunkText = new TextDecoder().decode(value)
      buffer += chunkText

      // 尝试提取完整的 JSON 对象
      while (true) {
        const startIdx = buffer.indexOf("{")
        if (startIdx === -1) {
          if (!buffer.startsWith("//OEx")) {
            buffer = ""
          }
          break
        }

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

        if (endIdx === -1) break

        const jsonStr = buffer.slice(startIdx, endIdx + 1)
        buffer = buffer.slice(endIdx + 1)

        try {
          const data = JSON.parse(jsonStr)

          if (data.code !== undefined && data.code !== 0 && data.code !== 20000000) {
            console.log(`❌ 业务错误 [${data.code}]: ${data.message}`)
            return
          }

          if (data.data && typeof data.data === "string" && data.data.startsWith("//OEx")) {
            audioBase64 += data.data
          }
        } catch {
          // JSON 解析失败
        }
      }

      // 处理缓冲区中剩余的音频数据
      if (buffer.includes("//OEx")) {
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

    console.log(`\n✅ 完成! 共 ${chunkCount} chunks`)
    console.log(`🎵 音频数据: ${audioBase64.length} chars`)

    if (audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, "base64")
      console.log(`📀 解码后大小: ${audioBuffer.length} bytes`)
      console.log(`🔍 前4字节: ${audioBuffer.slice(0, 4).toString('hex')}`)

      // 保存到文件
      const outputPath = resolve(process.cwd(), 'test-tts-output.mp3')
      writeFileSync(outputPath, audioBuffer)
      console.log(`💾 已保存到: ${outputPath}`)

      // 验证 MP3
      const isMp3 = audioBuffer[0] === 0x49 && audioBuffer[1] === 0x44 && audioBuffer[2] === 0x33 ||
                    audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0
      console.log(`✅ 有效MP3: ${isMp3}`)

      // 检查音频帧
      let frameCount = 0
      for (let i = 0; i < audioBuffer.length - 1; i++) {
        if (audioBuffer[i] === 0xFF && (audioBuffer[i + 1] & 0xE0) === 0xE0) {
          frameCount++
        }
      }
      console.log(`🎵 MPEG 帧数: ${frameCount}`)
    }

  } catch (error) {
    console.error("❌ 异常:", error)
  }
}

testTTS()
