import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getSession } from "@/lib/auth/session"
import { chatCompletion } from "@/lib/ai/llm"
import { imageToImage } from "@/lib/ai/image"
import { textToSpeech } from "@/lib/ai/tts"
import { buildSystemPrompt } from "@/lib/prompts/system"
import { buildImagePrompt } from "@/lib/prompts/image"
import { getUserProfileText, extractAndSaveMemory } from "@/lib/memory"
import { getAffinityStage, shouldSendPhoto, updateAffinity } from "@/lib/affinity"
import type { AffinityStage } from "@/types"
import { put } from "@vercel/blob"
import type { PutCommandOptions } from "@vercel/blob"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const { characterId } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, userCharacterId } = await request.json()
    if (!message || !userCharacterId) {
      return NextResponse.json({ error: "Missing message or userCharacterId" }, { status: 400 })
    }

    const userCharacter = await prisma.userCharacter.findUnique({
      where: { id: userCharacterId },
      include: { character: true },
    })

    if (!userCharacter || userCharacter.characterId !== characterId) {
      return NextResponse.json({ error: "Invalid user character" }, { status: 403 })
    }

    const character = userCharacter.character

    const recentMessages = await prisma.message.findMany({
      where: { userCharacterId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { role: true, content: true },
    })

    const userProfileText = await getUserProfileText(userCharacterId)
    const affinity = userCharacter.affinity
    const stage = getAffinityStage(affinity)

    // 阶段2增强：检查是否有待处理的阶段变化
    const pendingStageTransition = userCharacter.pendingStageTransition as AffinityStage | null

    const systemPrompt = buildSystemPrompt(
      character,
      userProfileText,
      session.email,
      affinity,
      stage,
      pendingStageTransition
    )

    const conversationHistory = recentMessages.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
      { role: "user" as const, content: message },
    ]

    const assistantContent = await chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 120,
    })

    // 强制过滤旁白：移除所有括号内容（包括圆括号、方括号、花括号、书名号等）
    let cleanContent = assistantContent
      // 移除 [SEND_PHOTO:...] 标记
      .replace(/\[SEND_PHOTO:\s*[^\]]+\]/g, "")
      // 移除圆括号及其中内容：(手机差点摔了，整个人愣住了)
      .replace(/\([^)]*\)/g, "")
      // 移除中文全角括号及其中内容：（手机差点摔了）
      .replace(/（[^）]*）/g, "")
      // 移除方括号及其中内容（除已处理的 SEND_PHOTO）
      .replace(/\[[^\]]*\]/g, "")
      // 移除花括号及其中内容
      .replace(/\{[^}]*\}/g, "")
      // 移除尖括号及其中内容
      .replace(/<[^>]*>/g, "")
      // 移除 *动作* 或 *神态* 格式的旁白
      .replace(/\*[^*]+\*/g, "")
      // 移除 ~动作~ 格式的旁白
      .replace(/~[^~]+~/g, "")
      // 移除 "动作：" 或 "神态：" 前缀的行
      .replace(/^[\s]*(?:动作|神态|表情|心理|旁白|场景|描述)[：:].*$/gim, "")
      // 移除 "（" 或 "(" 开头的整行
      .replace(/^[\s]*[（(].*$/gm, "")
      // 清理多余空行
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    // 进一步清理：如果某行包含明显的旁白关键词，移除整行
    const narrationKeywords = [
      "手机", "翻过来", "倒在", "滚了", "举起来", "凑近", "屏幕",
      "表情", "假装", "眼角", "藏不住", "想半天", "泄气", "翻身",
      "小声", "嘟囔", "嘴硬", "愣住", "看了一眼", "确认"
    ]
    const lines = cleanContent.split("\n")
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim()
      if (!trimmed) return false
      // 如果整行都是旁白关键词，过滤掉
      const isNarration = narrationKeywords.some(kw => trimmed.includes(kw)) && 
        !trimmed.match(/[？?！!。，,\s]{2,}/) // 保留有明显标点（对话特征）的行
      return !isNarration
    })
    cleanContent = filteredLines.join("\n").trim()

    // 如果过滤后内容为空，给一个默认回复
    if (!cleanContent || cleanContent.length < 2) {
      cleanContent = "怎么啦？"
    }

    // 限制总长度（最多100个字符）
    if (cleanContent.length > 100) {
      cleanContent = cleanContent.slice(0, 100) + "..."
    }

    const sendPhotoMatch = assistantContent.match(/\[SEND_PHOTO:\s*([^\]]+)\]/)

    let imageUrl: string | null = null

    if (sendPhotoMatch) {
      const sceneDescription = sendPhotoMatch[1].trim()

      if (shouldSendPhoto(affinity) && character.baselineImageUrl) {
        try {
          const imagePrompt = buildImagePrompt(character, sceneDescription)
          const generatedImageUrl = await imageToImage(character.baselineImageUrl, imagePrompt)

          const response = await fetch(generatedImageUrl)
          const blob = await response.blob()
          const { url } = await put(`chat-images/${userCharacterId}-${Date.now()}.png`, blob, { access: "public" } as PutCommandOptions)
          imageUrl = url
        } catch (err) {
          console.error("[Chat] Image generation failed:", err)
        }
      }
    }

    const userMessageRecord = await prisma.message.create({
      data: {
        userCharacterId,
        role: "user",
        content: message,
      },
    })

    const assistantMessageRecord = await prisma.message.create({
      data: {
        userCharacterId,
        role: "assistant",
        content: cleanContent,
        imageUrl,
      },
    })

    // Generate TTS audio after message is created (only if user enabled TTS)
    let audioUrl: string | null = null
    process.stderr.write(`[Chat] TTS Check: voiceId=${character.voiceId}, ttsEnabled=${userCharacter.ttsEnabled}\n`)
    if (character.voiceId && userCharacter.ttsEnabled) {
      try {
        process.stderr.write(`[Chat] Generating TTS with voice: ${character.voiceId}\n`)
        audioUrl = await textToSpeech(cleanContent.slice(0, 500), character.voiceId)
        process.stderr.write(`[Chat] TTS result: ${audioUrl ? "Success" : "Failed"}\n`)
        if (audioUrl) {
          await prisma.message.update({
            where: { id: assistantMessageRecord.id },
            data: { audioUrl },
          })
          process.stderr.write(`[Chat] TTS saved to message: ${assistantMessageRecord.id}\n`)
        }
      } catch (err) {
        process.stderr.write(`[TTS] Generation error: ${err}\n`)
      }
    } else {
      process.stderr.write("[Chat] TTS skipped - voiceId or ttsEnabled not available\n")
    }

    await prisma.userCharacter.update({
      where: { id: userCharacterId },
      data: {
        lastChatAt: new Date(),
        // 阶段2增强：如果使用了阶段变化提示，清除 pendingStageTransition
        ...(pendingStageTransition && { pendingStageTransition: null }),
      },
    })

    extractAndSaveMemory(userCharacterId, message, cleanContent).catch((err) =>
      console.error("[Memory] Async extraction error:", err)
    )
    updateAffinity(userCharacterId, message, cleanContent).catch((err) =>
      console.error("[Affinity] Async update error:", err)
    )

    return NextResponse.json({
      content: cleanContent,
      imageUrl,
      audioUrl, // TTS 音频 URL
      messageId: assistantMessageRecord.id,
      userMessageId: userMessageRecord.id,
    })
  } catch (error) {
    console.error("[Chat] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
