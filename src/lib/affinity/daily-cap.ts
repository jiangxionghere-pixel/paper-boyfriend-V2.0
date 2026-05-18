import { prisma } from "@/lib/db/prisma"

const DAILY_GAIN_CAP = 8 // 每日正向情感值上限
const DAILY_LOSS_CAP = -5 // 每日负向情感值下限

/**
 * 检查并应用日累积上限约束
 * 返回实际可应用的 delta 值（可能为 0，如果已达上限）
 */
export async function applyDailyCap(
  userCharacterId: string,
  delta: number
): Promise<number> {
  if (delta === 0) return 0

  const userCharacter = await prisma.userCharacter.findUnique({
    where: { id: userCharacterId },
    select: { lastAffinityDate: true, dailyAffinityDelta: true },
  })

  if (!userCharacter) return 0

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDate = userCharacter.lastAffinityDate
    ? new Date(
        userCharacter.lastAffinityDate.getFullYear(),
        userCharacter.lastAffinityDate.getMonth(),
        userCharacter.lastAffinityDate.getDate()
      )
    : null

  // 如果是新的一天，重置日累积
  let currentDailyDelta = userCharacter.dailyAffinityDelta
  if (!lastDate || lastDate.getTime() !== today.getTime()) {
    currentDailyDelta = 0
    await prisma.userCharacter.update({
      where: { id: userCharacterId },
      data: {
        lastAffinityDate: now,
        dailyAffinityDelta: 0,
      },
    })
  }

  // 正向 delta 检查上限
  if (delta > 0) {
    const remaining = DAILY_GAIN_CAP - currentDailyDelta
    if (remaining <= 0) return 0
    return Math.min(delta, remaining)
  }

  // 负向 delta 检查下限
  if (delta < 0) {
    const remaining = Math.abs(DAILY_LOSS_CAP) - Math.abs(currentDailyDelta)
    if (remaining <= 0) return 0
    return Math.max(delta, -remaining)
  }

  return delta
}

/**
 * 更新日累积值
 */
export async function updateDailyDelta(
  userCharacterId: string,
  appliedDelta: number
): Promise<void> {
  if (appliedDelta === 0) return

  await prisma.userCharacter.update({
    where: { id: userCharacterId },
    data: {
      dailyAffinityDelta: {
        increment: appliedDelta,
      },
      lastAffinityDate: new Date(),
    },
  })
}
