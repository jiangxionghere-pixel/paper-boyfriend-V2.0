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
      temperature: 0.8,
      maxTokens: 1024,
    })

    const sendPhotoMatch = assistantContent.match(/\[SEND_PHOTO:\s*([^\]]+)\]/)
    const cleanContent = assistantContent
      .replace(/\[SEND_PHOTO:\s*[^\]]+\]/g, "")
      .trim()

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

    // Generate TTS audio after message is created
    let audioUrl: string | null = null
    if (character.voiceId) {
      try {
        audioUrl = await textToSpeech(cleanContent.slice(0, 500), character.voiceId)
        if (audioUrl) {
          await prisma.message.update({
            where: { id: assistantMessageRecord.id },
            data: { audioUrl },
          })
        }
      } catch (err) {
        console.error("[TTS] Generation error:", err)
      }
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
