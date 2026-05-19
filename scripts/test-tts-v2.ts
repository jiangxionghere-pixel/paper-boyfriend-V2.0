/**
 * 豆包语音合成模型 2.0 API 测试
 * 使用 uranus_bigtts 音色
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const TTS_API_KEY = process.env.TTS_API_KEY || ""
const TTS_APP_ID = process.env.TTS_APP_ID || ""

const TEST_VOICES = [
  { name: "云舟 2.0 (男)", speaker: "zh_male_m191_uranus_bigtts" },
  { name: "小天 2.0 (男)", speaker: "zh_male_taocheng_uranus_bigtts" },
  { name: "Vivi 2.0 (女)", speaker: "zh_female_vv_uranus_bigtts" },
  { name: "小何 2.0 (女)", speaker: "zh_female_xiaohe_uranus_bigtts" },
]

async function testTTS(voice: typeof TEST_VOICES[0]) {
  console.log(`\n🎙️ 测试音色: ${voice.name}`)
  console.log(`   Speaker: ${voice.speaker}`)

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
            text: "你好，我是纸片人男友，很高兴认识你。今天过得怎么样？",
            speaker: voice.speaker,
            audio_params: { format: "mp3", sample_rate: 24000 },
          },
        }),
      }
    )

    console.log(`   状态码: ${response.status}`)

    if (!response.ok) {
      const error = await response.text()
      console.log(`   ❌ HTTP错误: ${error.substring(0, 300)}`)
      return false
    }

    const reader = response.body?.getReader()
    if (!reader) {
      console.log(`   ❌ 无响应体`)
      return false
    }

    let audioBase64 = ""
    let hasError = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunkText = new TextDecoder().decode(value)
      const lines = chunkText.split("\n").filter(l => l.trim())

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.code !== undefined && data.code !== 0) {
            console.log(`   ❌ 业务错误 [${data.code}]: ${data.message}`)
            hasError = true
          }
          if (data.data?.audio) {
            audioBase64 += data.data.audio
          }
        } catch {}
      }
    }

    if (hasError) return false

    if (audioBase64) {
      const buffer = Buffer.from(audioBase64, "base64")
      console.log(`   ✅ 成功! 音频大小: ${buffer.length} bytes`)
      return true
    } else {
      console.log(`   ⚠️ 无音频数据`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ 异常: ${error}`)
    return false
  }
}

async function main() {
  console.log("🔍 豆包语音合成模型 2.0 API 测试")
  console.log("=" .repeat(60))
  console.log(`App ID: ${TTS_APP_ID}`)
  console.log(`API Key: ${TTS_API_KEY ? TTS_API_KEY.slice(0, 8) + "..." : "未设置"}`)
  console.log(`Resource ID: seed-tts-2.0`)
  console.log("")

  if (!TTS_API_KEY || !TTS_APP_ID) {
    console.error("❌ 环境变量未配置")
    return
  }

  let successCount = 0
  for (const voice of TEST_VOICES) {
    const success = await testTTS(voice)
    if (success) successCount++
  }

  console.log("\n" + "=".repeat(60))
  console.log(`测试结果: ${successCount}/${TEST_VOICES.length} 个音色可用`)

  if (successCount === 0) {
    console.log("\n💡 可能的原因:")
    console.log("   1. 服务未开通试用/付费")
    console.log("   2. API Key 不属于当前应用")
    console.log("   3. 账号没有免费额度")
    console.log("\n   请访问: https://console.volcengine.com/speech/service/10035")
    console.log("   点击'立即体验'开通服务")
  }
}

main()
