/**
 * TTS API 测试 - 尝试多种资源ID
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

const TEST_CONFIGS = [
  { name: "豆包语音合成1.0", resourceId: "seed-tts-1.0", speaker: "zh_male_yangguangqingnian_emo_v2_mars_bigtts" },
  { name: "豆包语音合成1.0 字符版", resourceId: "volc.service_type.10029", speaker: "zh_male_yangguangqingnian_emo_v2_mars_bigtts" },
  { name: "豆包语音合成2.0", resourceId: "seed-tts-2.0", speaker: "zh_male_m191_uranus_bigtts" },
  { name: "语音合成大模型", resourceId: "volc.service_type.10029", speaker: "zh_male_yangguangqingnian_emo_v2_mars_bigtts" },
]

async function testTTS(config: typeof TEST_CONFIGS[0]) {
  console.log(`\n🧪 测试: ${config.name}`)
  console.log(`   Resource ID: ${config.resourceId}`)
  console.log(`   Speaker: ${config.speaker}`)

  try {
    const response = await fetch(
      "https://openspeech.bytedance.com/api/v3/tts/unidirectional",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-App-Id": TTS_APP_ID,
          "X-Api-Access-Key": TTS_API_KEY,
          "X-Api-Resource-Id": config.resourceId,
        },
        body: JSON.stringify({
          user: { uid: "test-user" },
          req_params: {
            text: "你好，这是一个测试。",
            speaker: config.speaker,
            audio_params: { format: "mp3", sample_rate: 24000 },
          },
        }),
      }
    )

    console.log(`   状态: ${response.status}`)

    if (!response.ok) {
      const error = await response.text()
      console.log(`   ❌ 错误: ${error.substring(0, 200)}`)
      return false
    }

    // Read first chunk
    const reader = response.body?.getReader()
    if (!reader) return false

    const { value } = await reader.read()
    if (value) {
      const text = new TextDecoder().decode(value)
      console.log(`   📦 响应: ${text.substring(0, 200)}`)

      // Try parse
      const lines = text.split("\n").filter(l => l.trim())
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.code === 0) {
            console.log(`   ✅ 成功!`)
            return true
          } else {
            console.log(`   ⚠️ 业务错误: ${data.message}`)
          }
        } catch {}
      }
    }
    return false
  } catch (error) {
    console.log(`   ❌ 异常: ${error}`)
    return false
  }
}

async function main() {
  console.log("🔍 TTS API 多配置测试")
  console.log("=" .repeat(60))
  console.log(`App ID: ${TTS_APP_ID}`)
  console.log(`API Key: ${TTS_API_KEY ? TTS_API_KEY.slice(0, 8) + "..." : "未设置"}`)
  console.log("")

  if (!TTS_API_KEY || !TTS_APP_ID) {
    console.error("❌ 环境变量未配置")
    return
  }

  for (const config of TEST_CONFIGS) {
    const success = await testTTS(config)
    if (success) {
      console.log("\n🎉 找到可用配置!")
      break
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("测试完成")
}

main()
