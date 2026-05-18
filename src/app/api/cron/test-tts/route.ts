import { NextResponse } from "next/server"
import { textToSpeech } from "@/lib/ai/tts"

/**
 * TTS 测试接口
 * 用于测试豆包语音合成模型 2.0 是否正常工作
 *
 * 使用方式:
 * GET /api/cron/test-tts?secret=CRON_SECRET&text=你好，我是林屿&voiceId=zh_male_yangguangqingnian_emo_v2_mars_bigtts
 *
 * 豆包 TTS 2.0 音色列表:
 * - 林屿(温柔内敛): zh_male_yangguangqingnian_emo_v2_mars_bigtts
 * - 顾昭(成熟稳重): zh_male_jingqiangkanye_emo_mars_bigtts
 * - 陈牧(阳光开朗): zh_male_beijingxiaoye_emo_v2_mars_bigtts
 * - 白夜(文艺安静): zh_male_yourougongzi_emo_v2_mars_bigtts
 * - 霍砺(霸道强势): zh_male_aojiaobazong_emo_v2_mars_bigtts
 * - 夏知(软甜治愈): zh_female_roumeinvyou_emo_v2_mars_bigtts
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const text = searchParams.get("text") || "你好，我是纸片人男友，很高兴认识你。"
    const voiceId = searchParams.get("voiceId") || "zh_male_yangguangqingnian_emo_v2_mars_bigtts"

    console.log(`[TTS Test] Testing Doubao TTS 2.0 with voice: ${voiceId}`)
    console.log(`[TTS Test] Text: ${text.slice(0, 50)}...`)

    const startTime = Date.now()
    const audioUrl = await textToSpeech(text, voiceId)
    const duration = Date.now() - startTime

    if (!audioUrl) {
      return NextResponse.json({
        success: false,
        error: "TTS generation failed",
        details: {
          voiceId,
          text: text.slice(0, 100),
          duration: `${duration}ms`,
          env: {
            TTS_API_KEY: process.env.TTS_API_KEY ? "已设置" : "未设置",
            TTS_APP_ID: process.env.TTS_APP_ID ? "已设置" : "未设置",
          },
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: `${duration}ms`,
      details: {
        voiceId,
        text: text.slice(0, 100),
        textLength: text.length,
      },
    })
  } catch (error) {
    console.error("[TTS Test] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
