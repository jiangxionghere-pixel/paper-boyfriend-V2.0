import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const testText = "你好，这是一条测试语音"
  const voiceId = "zh_male_m191_uranus_bigtts"
  
  process.stderr.write("[TestTTS] Starting TTS test\n")
  
  // 直接内联 TTS 逻辑以便调试
  const TTS_API_KEY = process.env.TTS_API_KEY || ""
  const TTS_APP_ID = process.env.TTS_APP_ID || ""
  
  process.stderr.write(`[TestTTS] Env check: hasApiKey=${!!TTS_API_KEY}, hasAppId=${!!TTS_APP_ID}, keyLength=${TTS_API_KEY?.length || 0}\n`)
  
  if (!TTS_API_KEY || !TTS_APP_ID) {
    return NextResponse.json({ 
      success: false, 
      error: "环境变量未配置",
      hasApiKey: !!TTS_API_KEY,
      hasAppId: !!TTS_APP_ID
    }, { status: 500 })
  }
  
  try {
    process.stderr.write("[TestTTS] Calling TTS API...\n")
    
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
            audio_params: {
              format: "mp3",
              sample_rate: 24000,
            },
          },
        }),
      }
    )
    
    process.stderr.write(`[TestTTS] API response status: ${response.status}\n`)
    
    if (!response.ok) {
      const errorText = await response.text()
      process.stderr.write(`[TestTTS] API error: ${errorText}\n`)
      return NextResponse.json({ 
        success: false, 
        error: `API HTTP ${response.status}: ${errorText}` 
      }, { status: 500 })
    }
    
    // 读取流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json({ 
        success: false, 
        error: "No response body" 
      }, { status: 500 })
    }
    
    let audioBase64 = ""
    let chunkCount = 0
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      chunkCount++
      const chunkText = new TextDecoder().decode(value)
      
      const lines = chunkText.split("\n").filter((line) => line.trim())
      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.code !== undefined && data.code !== 0 && data.code !== 20000000) {
            process.stderr.write(`[TestTTS] Business error [${data.code}]: ${data.message}\n`)
            return NextResponse.json({ 
              success: false, 
              error: `Business error [${data.code}]: ${data.message}` 
            }, { status: 500 })
          }
          if (data.data && typeof data.data === "string") {
            audioBase64 += data.data
          }
          if (data.data?.audio) {
            audioBase64 += data.data.audio
          }
        } catch {
          // 非 JSON 行
        }
      }
    }
    
    process.stderr.write(`[TestTTS] Received ${chunkCount} chunks, audio length: ${audioBase64.length}\n`)
    
    if (!audioBase64) {
      return NextResponse.json({ 
        success: false, 
        error: "No audio data received" 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "TTS 生成成功",
      chunks: chunkCount,
      audioLength: audioBase64.length
    })
    
  } catch (error) {
    process.stderr.write(`[TestTTS] Exception: ${error}\n`)
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 })
  }
}
