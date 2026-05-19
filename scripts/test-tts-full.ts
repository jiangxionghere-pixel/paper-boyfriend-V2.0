/**
 * 豆包语音合成模型 2.0 完整测试
 * 测试音频生成和保存
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

async function testTTS() {
  console.log("🎙️ 豆包语音合成模型 2.0 完整测试")
  console.log("=" .repeat(60))

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
            text: "你好，我是纸片人男友，很高兴认识你！",
            speaker: "zh_male_m191_uranus_bigtts",
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

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunkText = new TextDecoder().decode(value)

      const lines = chunkText.split("\n").filter(l => l.trim())
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.code !== undefined && data.code !== 0 && data.code !== 20000000) {
            console.error(`❌ 业务错误 [${data.code}]: ${data.message}`)
            return
          }
          // 音频数据在 data 字段直接存放
          if (data.data && typeof data.data === "string") {
            audioBase64 += data.data
          }
        } catch {}
      }
    }

    console.log(`📦 收到 ${chunkCount} chunks`)
    console.log(`🎵 音频数据: ${audioBase64.length} chars (base64)`)

    if (!audioBase64) {
      console.log("❌ 无音频数据")
      return
    }

    // 解码并保存
    const audioBuffer = Buffer.from(audioBase64, "base64")
    console.log(`📀 解码后: ${audioBuffer.length} bytes`)

    // 保存到本地
    const outputPath = resolve(process.cwd(), "test-tts-output.mp3")
    writeFileSync(outputPath, audioBuffer)
    console.log(`💾 已保存: ${outputPath}`)

    console.log("\n✅ TTS 测试成功!")

  } catch (error) {
    console.error("❌ 异常:", error)
  }
}

testTTS()
