import { prisma } from "@/lib/db/prisma"
import { smallModelCompletion } from "@/lib/ai/llm"
import { EMOTION_ANALYSIS_PROMPT } from "@/lib/prompts/emotion"
import { calculateWeightedDelta, clampAffinity } from "./weighting"
import { applyDailyCap, updateDailyDelta } from "./daily-cap"
import { checkStageTransition } from "./stages"
import type { EmotionAnalysisResult } from "@/types"

export async function updateAffinity(
  userCharacterId: string,
  userMsg: string,
  assistantMsg: string
): Promise<void> {
  try {
    const userCharacter = await prisma.userCharacter.findUnique({
      where: { id: userCharacterId },
      include: { character: true },
    })

    if (!userCharacter) return

    const userPrompt = `用户消息: ${userMsg}\n角色回复: ${assistantMsg}\n\n请分析这段对话中用户的态度，输出JSON。`

    const rawOutput = await smallModelCompletion(EMOTION_ANALYSIS_PROMPT, userPrompt, {
      temperature: 0.1,
    })

    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return

    const analysis: EmotionAnalysisResult = JSON.parse(jsonMatch[0])

    if (
      typeof analysis.delta !== "number" ||
      analysis.delta === 0
    ) {
      return
    }

    const hasMentionedOther = analysis.triggers?.includes("提到他人") ?? false
    const weightedDelta = calculateWeightedDelta(analysis.delta, userCharacter.character, hasMentionedOther)

    if (weightedDelta === 0) return

    // 应用日累积上限约束
    const finalDelta = await applyDailyCap(userCharacterId, weightedDelta)
    if (finalDelta === 0) {
      console.log(`[Affinity] Daily cap reached for ${userCharacterId}, delta ${weightedDelta} blocked`)
      return
    }

    const affinityBefore = userCharacter.affinity
    const affinityAfter = clampAffinity(affinityBefore + finalDelta)

    // 检查阶段变化
    const stageTransition = checkStageTransition(affinityBefore, affinityAfter)

    await prisma.$transaction([
      prisma.userCharacter.update({
        where: { id: userCharacterId },
        data: {
          affinity: affinityAfter,
          // 如果有阶段变化，写入 pendingStageTransition
          ...(stageTransition && { pendingStageTransition: stageTransition }),
        },
      }),
      prisma.affinityLog.create({
        data: {
          userCharacterId,
          delta: finalDelta,
          reason: analysis.reason || "",
          triggers: analysis.triggers || [],
          affinityBefore,
          affinityAfter,
        },
      }),
    ])

    // 更新日累积值
    await updateDailyDelta(userCharacterId, finalDelta)

    if (stageTransition) {
      console.log(`[Affinity] Stage transition for ${userCharacterId}: ${stageTransition}`)
    }
    console.log(`[Affinity] Updated ${userCharacterId}: ${affinityBefore} -> ${affinityAfter} (delta: ${finalDelta}, raw: ${analysis.delta})`)
  } catch (error) {
    console.error("[Affinity] Failed to update affinity:", error)
  }
}
