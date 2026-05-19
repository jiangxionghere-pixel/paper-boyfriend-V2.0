import { NextRequest, NextResponse } from "next/server"
import { textToSpeech } from "@/lib/ai/tts"

export async function GET(req: NextRequest) {
  const testText = "你好，这是一条测试语音"
  const voiceId = "zh_male_m191_uranus_bigtts"
  
  process.stderr.write("[TestTTS] Starting TTS test\n")
  
  try {
    const audioUrl = await textToSpeech(testText, voiceId)
    
    if (audioUrl) {
      process.stderr.write(`[TestTTS] Success: ${audioUrl}\n`)
      return NextResponse.json({ 
        success: true, 
        audioUrl,
        message: "TTS 测试成功" 
      })
    } else {
      process.stderr.write("[TestTTS] Failed: no audioUrl returned\n")
      return NextResponse.json({ 
        success: false, 
        error: "TTS 生成失败，请检查日志" 
      }, { status: 500 })
    }
  } catch (error) {
    process.stderr.write(`[TestTTS] Error: ${error}\n`)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
