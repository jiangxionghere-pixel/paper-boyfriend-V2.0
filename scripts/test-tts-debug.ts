/**
 * 豆包语音合成模型 2.0 API 调试
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

async function testTTS() {
  console.log("🔍 豆包语音合成模型 2.0 API 调试")
  console.log("=" .repeat(60))
  console.log(`App ID: ${TTS_APP_ID}`)
  console.log(`API Key: ${TTS_API_KEY ? TTS_API_KEY.slice(0, 10) + "..." : "未设置"}`)
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
            text: "你好，这是一个测试。",
            speaker: "zh_male_m191_uranus_bigtts",
            audio_params: { format: "mp3", sample_rate: 24000 },
          },
        }),
      }
    )

    console.log(`📡 HTTP 状态: ${response.status}`)
    console.log("")

    const reader = response.body?.getReader()
    if (!reader) {
      console.log("❌ 无响应体")
      return
    }

    let chunkCount = 0
    let totalAudioLength = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunkText = new TextDecoder().decode(value)

      console.log(`\n📦 Chunk ${chunkCount} (${value.length} bytes):`)
      console.log("-".repeat(40))

      const lines = chunkText.split("\n").filter(l => l.trim())
      for (const line of lines) {
        console.log(`原始: ${line.substring(0, 200)}`)
        try {
          const data = JSON.parse(line)
          console.log(`解析: ${JSON.stringify(data, null, 2).substring(0, 500)}`)

          if (data.header) {
            console.log(`   业务码: ${data.header.code}`)
            console.log(`   消息: ${data.header.message}`)
          }
          if (data.code !== undefined) {
            console.log(`   code: ${data.code}`)
          }
          if (data.message) {
            console.log(`   message: ${data.message}`)
          }
          if (data.data?.audio) {
            console.log(`   🎵 音频数据: ${data.data.audio.length} chars`)
            totalAudioLength += data.data.audio.length
          }
        } catch (e) {
          console.log(`   ⚠️ 非 JSON: ${line.substring(0, 100)}`)
        }
      }
    }

    console.log("\n" + "=".repeat(60))
    console.log(`✅ 完成! 共 ${chunkCount} chunks, 音频数据: ${totalAudioLength} chars`)

  } catch (error) {
    console.error("❌ 异常:", error)
  }
}

testTTS()
