import { prisma } from "@/lib/db/prisma"
import { chatCompletion } from "@/lib/ai/llm"
import { buildSystemPrompt } from "@/lib/prompts/system"
import { getUserProfileText } from "@/lib/memory"
import { getAffinityStage } from "@/lib/affinity"

/**
 * 角色主动发消息（挑战项）
 * 当用户超过一定时间未互动时，角色会主动发消息
 * 触发条件：
 * 1. 亲密期/热恋期角色
 * 2. 用户超过 6 小时未发消息
 * 3. 每日最多触发 1 次
 */

const PROACTIVE_COOLDOWN_HOURS = 6
const MAX_DAILY_PROACTIVE = 1

export async function shouldSendProactiveMessage(
  userCharacterId: string
): Promise<boolean> {
  const userCharacter = await prisma.userCharacter.findUnique({
    where: { id: userCharacterId },
    include: { character: true },
  })

  if (!userCharacter) return false

  const stage = getAffinityStage(userCharacter.affinity)

  // 只有亲密期和热恋期才会主动发消息
  if (stage !== "亲密期" && stage !== "热恋期") return false

  // 检查上次聊天时间
  if (!userCharacter.lastChatAt) return false

  const now = new Date()
  const hoursSinceLastChat = (now.getTime() - userCharacter.lastChatAt.getTime()) / (1000 * 60 * 60)

  if (hoursSinceLastChat < PROACTIVE_COOLDOWN_HOURS) return false

  // 检查今日已触发次数
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayCount = await prisma.message.count({
    where: {
      userCharacterId,
      role: "assistant",
      createdAt: {
        gte: today,
      },
      // 主动消息标记：内容以特定前缀开头
      content: {
        startsWith: "【",
      },
    },
  })

  return todayCount < MAX_DAILY_PROACTIVE
}

export async function generateProactiveMessage(
  userCharacterId: string
): Promise<{ content: string; imageUrl?: string } | null> {
  try {
    const userCharacter = await prisma.userCharacter.findUnique({
      where: { id: userCharacterId },
      include: { character: true, user: true },
    })

    if (!userCharacter) return null

    const character = userCharacter.character
    const userProfileText = await getUserProfileText(userCharacterId)
    const stage = getAffinityStage(userCharacter.affinity)

    const systemPrompt = buildSystemPrompt(
      character,
      userProfileText,
      userCharacter.user.email,
      userCharacter.affinity,
      stage
    )

    const proactivePrompt = `用户已经有一段时间没有回复你了。请根据你的性格和当前情境，主动发一条消息给用户。可以是：
- 分享你正在做的事
- 表达想念
- 关心用户近况
- 分享一个有趣的发现

注意：消息要自然、符合你的性格，不要显得刻意。保持你一贯的语言风格。`

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: proactivePrompt },
    ]

    const content = await chatCompletion(messages, {
      temperature: 0.9,
      maxTokens: 512,
    })

    // 添加主动消息标记
    const markedContent = `【${character.name}发来消息】\n${content.trim()}`

    return { content: markedContent }
  } catch (error) {
    console.error("[Proactive] Failed to generate message:", error)
    return null
  }
}

export async function sendProactiveMessage(
  userCharacterId: string
): Promise<void> {
  const shouldSend = await shouldSendProactiveMessage(userCharacterId)
  if (!shouldSend) return

  const result = await generateProactiveMessage(userCharacterId)
  if (!result) return

  await prisma.message.create({
    data: {
      userCharacterId,
      role: "assistant",
      content: result.content,
      imageUrl: result.imageUrl || null,
    },
  })

  await prisma.userCharacter.update({
    where: { id: userCharacterId },
    data: { lastChatAt: new Date() },
  })

  console.log(`[Proactive] Sent proactive message to ${userCharacterId}`)
}
