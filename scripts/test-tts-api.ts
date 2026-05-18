/**
 * TTS API 直接测试脚本
 * 绕过应用层，直接测试火山引擎 TTS API
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

// 加载环境变量
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

async function testTTS() {
  console.log("🔍 TTS API 直接测试")
  console.log("=" .repeat(50))
  console.log(`API Key: ${TTS_API_KEY ? "✅ 已设置 (" + TTS_API_KEY.slice(0, 8) + "...)" : "❌ 未设置"}`)
  console.log(`App ID: ${TTS_APP_ID ? "✅ 已设置 (" + TTS_APP_ID + ")" : "❌ 未设置"}`)
  console.log("")

  if (!TTS_API_KEY || !TTS_APP_ID) {
    console.error("❌ 环境变量未配置完整")
    return
  }

  const testText = "你好，我是纸片人男友，很高兴认识你。"
  const voiceId = "zh_male_yangguangqingnian_emo_v2_mars_bigtts"

  console.log(`📝 测试文本: ${testText}`)
  console.log(`🎙️  音色: ${voiceId}`)
  console.log("")

  try {
    const startTime = Date.now()
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
            text: testText,
            speaker: voiceId,
            audio_params: {
              format: "mp3",
              sample_rate: 24000,
            },
          },
        }),
      }
    )

    console.log(`📡 响应状态: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API 错误: ${errorText}`)
      return
    }

    // 读取流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      console.error("❌ 无响应体")
      return
    }

    let audioBase64 = ""
    let chunkCount = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      chunkCount++
      const chunkText = new TextDecoder().decode(value)
      console.log(`\n📦 Chunk ${chunkCount} (${value.length} bytes):`)
      console.log(chunkText.substring(0, 300))

      const lines = chunkText.split("\n").filter((line) => line.trim())
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          console.log("📊 解析结果:", JSON.stringify(data, null, 2).substring(0, 800))

          if (data.data?.audio) {
            audioBase64 += data.data.audio
            console.log(`🎵 收到音频数据: ${data.data.audio.length} chars`)
          }
          if (data.data?.usage) {
            console.log("📈 Usage:", data.data.usage)
          }
          if (data.code !== undefined && data.code !== 0) {
            console.error(`❌ 业务错误码: ${data.code}, 消息: ${data.message}`)
          }
        } catch (e) {
          console.log("⚠️  非 JSON 行:", line.substring(0, 100))
        }
      }
    }

    const duration = Date.now() - startTime
    console.log("\n" + "=".repeat(50))
    console.log(`✅ 测试完成! 耗时: ${duration}ms`)
    console.log(`🎵 总音频数据: ${audioBase64.length} chars (base64)`)

    if (audioBase64) {
      const audioBuffer = Buffer.from(audioBase64, "base64")
      console.log(`📀 解码后大小: ${audioBuffer.length} bytes`)
      console.log("✅ TTS API 工作正常!")
    } else {
      console.log("⚠️  未收到音频数据，请检查响应内容")
    }

  } catch (error) {
    console.error("❌ 测试失败:", error)
  }
}

testTTS()
