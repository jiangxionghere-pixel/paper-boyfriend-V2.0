import { prisma } from "@/lib/db/prisma"
import { smallModelCompletion } from "@/lib/ai/llm"
import { MEMORY_EXTRACTION_PROMPT } from "@/lib/prompts/memory"
import type { MemoryExtractionResult } from "@/types"

export async function extractAndSaveMemory(
  userCharacterId: string,
  userMsg: string,
  assistantMsg: string
): Promise<void> {
  try {
    const userPrompt = `本轮对话：\n用户: ${userMsg}\n角色: ${assistantMsg}\n\n请从用户的消息中抽取值得记录的个人信息，输出JSON数组。`

    const rawOutput = await smallModelCompletion(MEMORY_EXTRACTION_PROMPT, userPrompt, {
      temperature: 0.1,
    })

    const jsonMatch = rawOutput.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return

    const memories: MemoryExtractionResult[] = JSON.parse(jsonMatch[0])
    if (!Array.isArray(memories) || memories.length === 0) return

    for (const mem of memories) {
      if (!mem.key || !mem.value) continue

      await prisma.userProfile.upsert({
        where: {
          userCharacterId_key: {
            userCharacterId,
            key: mem.key,
          },
        },
        update: { value: mem.value },
        create: {
          userCharacterId,
          key: mem.key,
          value: mem.value,
        },
      })
    }
  } catch (error) {
    console.error("[Memory] Failed to extract memory:", error)
  }
}

export async function getUserProfileText(userCharacterId: string): Promise<string> {
  const profiles = await prisma.userProfile.findMany({
    where: { userCharacterId },
  })

  if (profiles.length === 0) return ""

  return profiles.map((p) => `${p.key}：${p.value}`).join("；")
}
