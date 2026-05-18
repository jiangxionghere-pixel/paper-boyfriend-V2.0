import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendDailyLoveQuote } from "@/lib/email/resend"
import { chatCompletion } from "@/lib/ai/llm"
import { buildSystemPrompt } from "@/lib/prompts/system"
import { getAffinityStage } from "@/lib/affinity"

/**
 * 每日情话定时任务
 * 每天早上8点执行，给所有用户发送情话
 * cron-job.org 定时触发: 0 8 * * *
 */

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 获取所有有角色关系的用户（只要有关系就发送，不限制好感度）
    const userCharacters = await prisma.userCharacter.findMany({
      include: {
        user: true,
        character: true,
      },
    })

    console.log(`[Daily Love] Found ${userCharacters.length} user-character relationships`)

    const results = []

    for (const uc of userCharacters) {
      try {
        console.log(`[Daily Love] Processing ${uc.user.email} / ${uc.character.name}, affinity: ${uc.affinity}`)

        const stage = getAffinityStage(uc.affinity)

        // 生成情话
        const systemPrompt = buildSystemPrompt(
          uc.character,
          "",
          uc.user.email,
          uc.affinity,
          stage
        )

        const messages = [
          { role: "system" as const, content: systemPrompt },
          {
            role: "user" as const,
            content:
              '请用一句话表达你对用户的思念或爱意，要简短、真诚、符合你的性格。只输出这句话本身，不要加任何前缀或说明。',
          },
        ]

        const quote = await chatCompletion(messages, {
          temperature: 0.9,
          maxTokens: 100,
        })

        console.log(`[Daily Love] Generated quote for ${uc.character.name}: ${quote.trim()}`)

        // 发送邮件
        const result = await sendDailyLoveQuote(
          uc.user.email,
          uc.character.name,
          quote.trim()
        )

        console.log(`[Daily Love] Email result for ${uc.user.email}: success=${result.success}, id=${result.id}, error=${result.error ? JSON.stringify(result.error) : 'none'}`)

        results.push({
          userId: uc.userId,
          characterId: uc.characterId,
          email: uc.user.email,
          success: result.success,
          quote: quote.trim(),
          error: result.error || undefined,
        })
      } catch (err) {
        console.error(`[Daily Love] Failed for ${uc.userId}/${uc.characterId}:`, err)
        results.push({
          userId: uc.userId,
          characterId: uc.characterId,
          email: uc.user.email,
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
    console.error("[Cron] Daily love failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
