/**
 * 豆包语音合成模型 2.0 API 调试
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

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
    let audioBase64 = ""

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
          
          if (data.code !== undefined) {
            console.log(`   code: ${data.code}`)
          }
          if (data.message) {
            console.log(`   message: ${data.message}`)
          }
          
          // 检查 data.data 的类型和内容
          if (data.data !== undefined) {
            console.log(`   data type: ${typeof data.data}`)
            if (typeof data.data === "string") {
              console.log(`   data length: ${data.data.length}`)
              console.log(`   data startsWith //OEx: ${data.data.startsWith("//OEx")}`)
              if (data.data.startsWith("//OEx")) {
                audioBase64 += data.data
                console.log(`   🎵 音频数据已提取: ${data.data.length} chars`)
              }
            } else if (data.data === null) {
              console.log(`   data is null`)
            } else {
              console.log(`   data keys: ${Object.keys(data.data).join(", ")}`)
              if (data.data.audio) {
                console.log(`   🎵 audio: ${data.data.audio.length} chars`)
                audioBase64 += data.data.audio
              }
            }
          }
        } catch (e) {
          console.log(`   ⚠️ 非 JSON: ${line.substring(0, 100)}`)
          // 非 JSON 行，可能是音频数据片段
          if (line.startsWith("//OEx")) {
            audioBase64 += line
            console.log(`   🎵 非JSON音频数据已提取: ${line.length} chars`)
          }
        }
      }
    }

    console.log("\n" + "=".repeat(60))
    console.log(`✅ 完成! 共 ${chunkCount} chunks`)
    console.log(`🎵 总音频数据: ${audioBase64.length} chars`)

    if (audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, "base64")
      console.log(`📀 解码后大小: ${audioBuffer.length} bytes`)
      
      // 保存到文件测试
      const outputPath = resolve(process.cwd(), 'test-tts-output.mp3')
      writeFileSync(outputPath, audioBuffer)
      console.log(`💾 已保存到: ${outputPath}`)
      
      // 验证 MP3 头
      console.log(`🔍 前4字节: ${audioBuffer.slice(0, 4).toString('hex')}`)
      const isMp3 = audioBuffer[0] === 0x49 && audioBuffer[1] === 0x44 && audioBuffer[2] === 0x33 ||
                    audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0
      console.log(`✅ 有效MP3: ${isMp3}`)
    }

  } catch (error) {
    console.error("❌ 异常:", error)
  }
}

testTTS()
