import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendRecallEmail } from "@/lib/email/resend"
import { chatCompletion } from "@/lib/ai/llm"

/**
 * 3天未对话召回邮件
 * 每天执行，给3天未对话的用户发送召回邮件
 * 使用角色个性化口吻生成召回消息
 * cron-job.org 定时触发: 0 10 * * * (上午10点)
 */

export const dynamic = "force-dynamic"

const RECALL_DAYS = 3

/**
 * 根据角色性格生成个性化召回消息
 */
async function generateRecallMessage(character: {
  name: string
  speakingStyle: string
  background: string
  age: number
  occupation: string
}): Promise<string> {
  const prompt = `你是${character.name}，${character.age}岁，${character.occupation}。
${character.background}
${character.speakingStyle}

你和用户已经3天没有聊天了。请写一句简短的话（不超过30个字）表达你此刻的心情。
要求：
- 必须符合你的性格和说话风格
- 要真诚自然，不要像机器人
- 可以带一点小情绪（失落、想念、傲娇、温柔等，根据你的人物性格来定）
- 只输出这句话本身，不要加任何前缀或说明
- 不要出现"AI""程序""系统"等词`

  try {
    const message = await chatCompletion(
      [
        { role: "system", content: "你是一个角色扮演助手，帮助生成符合角色性格的文案。" },
        { role: "user", content: prompt },
      ],
      {
        temperature: 0.9,
        maxTokens: 80,
      }
    )
    return message.trim().replace(/^[""']|[""']$/g, "")
  } catch (error) {
    console.error(`[Recall] Failed to generate message for ${character.name}:`, error)
    // 根据角色名返回默认消息
    const defaults: Record<string, string> = {
      "林屿": "这几天... 代码写得不太顺，可能是因为没人催我休息吧。",
      "顾昭": "手术间隙，突然想到你。最近... 还好吗？",
      "陈牧": "喂！你都三天没出现了！我... 我才没有很想你呢！",
      "白夜": "古籍修到一半，窗外下雨了。忽然想起，好久没听到你的声音了。",
      "霍砺": "三天。你最好有个合理的解释。",
      "夏知": "今天烤了你喜欢的口味，才发现... 你已经三天没来了。",
    }
    return defaults[character.name] || "最近有点忙吗？我... 有点想你了。"
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - RECALL_DAYS * 24 * 60 * 60 * 1000)
    const fourDaysAgo = new Date(now.getTime() - (RECALL_DAYS + 1) * 24 * 60 * 60 * 1000)

    // 获取3天未对话的用户角色关系（且7天内没发过召回邮件）
    const userCharacters = await prisma.userCharacter.findMany({
      where: {
        lastChatAt: {
          gte: fourDaysAgo,
          lt: threeDaysAgo,
        },
        affinity: {
          gte: 30, // 至少有点感情基础才召回
        },
      },
      include: {
        user: true,
        character: true,
      },
    })

    const results = []

    for (const uc of userCharacters) {
      try {
        // 检查最近7天是否已发送过召回邮件
        const recentRecall = await prisma.affinityLog.findFirst({
          where: {
            userCharacterId: uc.id,
            reason: "召回邮件",
            createdAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        })

        if (recentRecall) {
          results.push({
            userId: uc.userId,
            characterId: uc.characterId,
            skipped: true,
            reason: "最近7天已发送过召回邮件",
          })
          continue
        }

        // 生成个性化召回消息
        const personalizedMessage = await generateRecallMessage(uc.character)

        // 发送召回邮件
        const result = await sendRecallEmail(
          uc.user.email,
          uc.character.name,
          uc.character.themeColor,
          personalizedMessage,
          uc.character.id
        )

        // 记录发送日志
        if (result.success) {
          await prisma.affinityLog.create({
            data: {
              userCharacterId: uc.id,
              delta: 0,
              reason: "召回邮件",
              triggers: [`连续${RECALL_DAYS}天未对话`],
              affinityBefore: uc.affinity,
              affinityAfter: uc.affinity,
            },
          })
        }

        results.push({
          userId: uc.userId,
          characterId: uc.characterId,
          success: result.success,
          message: personalizedMessage,
        })
      } catch (err) {
        console.error(`[Recall] Failed for ${uc.userId}/${uc.characterId}:`, err)
        results.push({
          userId: uc.userId,
          characterId: uc.characterId,
          success: false,
          error: String(err),
        })
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: userCharacters.length,
      results,
    })
  } catch (error) {
    console.error("[Cron] Recall failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
