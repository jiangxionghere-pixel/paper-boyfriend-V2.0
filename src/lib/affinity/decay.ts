import { prisma } from "@/lib/db/prisma"
import { getAffinityStage } from "./stages"
import { clampAffinity } from "./weighting"

const DECAY_START_DAYS = 7 // 连续7天未对话开始衰减
const DECAY_AMOUNT = 1 // 每日衰减1点
const MAX_DECAY = 15 // 单次连续不对话导致的衰减不超过15点

/**
 * 阶段3增强：日衰减机制
 * 连续7天以上未对话，每日扣1点 affinity
 * 单次连续不对话导致的衰减不超过15点
 */
export async function applyAffinityDecay(): Promise<{
  processed: number
  decayed: number
  details: Array<{
    userCharacterId: string
    daysSinceLastChat: number
    decayAmount: number
    affinityBefore: number
    affinityAfter: number
  }>
}> {
  const details: Array<{
    userCharacterId: string
    daysSinceLastChat: number
    decayAmount: number
    affinityBefore: number
    affinityAfter: number
  }> = []

  // 获取所有有聊天记录的角色关系
  const userCharacters = await prisma.userCharacter.findMany({
    where: {
      lastChatAt: {
        not: null,
      },
    },
    include: {
      character: true,
    },
  })

  const now = new Date()
  let processedCount = 0
  let decayedCount = 0

  for (const uc of userCharacters) {
    if (!uc.lastChatAt) continue

    const daysSinceLastChat = Math.floor(
      (now.getTime() - uc.lastChatAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // 只有超过7天未对话才衰减
    if (daysSinceLastChat < DECAY_START_DAYS) continue

    processedCount++

    // 计算本次应衰减的值
    // 衰减天数 = 总天数 - 7
    const decayDays = daysSinceLastChat - DECAY_START_DAYS + 1
    const decayAmount = Math.min(decayDays * DECAY_AMOUNT, MAX_DECAY)

    // 检查本次连续不对话已经衰减了多少
    const lastDecayLog = await prisma.affinityLog.findFirst({
      where: {
        userCharacterId: uc.id,
        reason: "连续未对话衰减",
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // 如果上次衰减是在这次连续不对话期间，计算已衰减总量
    let alreadyDecayed = 0
    if (lastDecayLog) {
      const daysSinceLastDecay = Math.floor(
        (now.getTime() - lastDecayLog.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      // 如果上次衰减是在这次连续不对话期间（即衰减后用户仍未对话）
      if (daysSinceLastDecay < daysSinceLastChat) {
        // 查询本次连续不对话期间的总衰减量
        const decayLogs = await prisma.affinityLog.findMany({
          where: {
            userCharacterId: uc.id,
            reason: "连续未对话衰减",
            createdAt: {
              gte: uc.lastChatAt,
            },
          },
        })
        alreadyDecayed = Math.abs(
          decayLogs.reduce((sum, log) => sum + log.delta, 0)
        )
      }
    }

    // 如果已达到最大衰减，跳过
    if (alreadyDecayed >= MAX_DECAY) continue

    // 计算本次实际应衰减的值
    const actualDecay = Math.min(decayAmount - alreadyDecayed, MAX_DECAY - alreadyDecayed)
    if (actualDecay <= 0) continue

    const affinityBefore = uc.affinity
    const affinityAfter = clampAffinity(affinityBefore - actualDecay)

    // 执行衰减
    await prisma.$transaction([
      prisma.userCharacter.update({
        where: { id: uc.id },
        data: { affinity: affinityAfter },
      }),
      prisma.affinityLog.create({
        data: {
          userCharacterId: uc.id,
          delta: -actualDecay,
          reason: "连续未对话衰减",
          triggers: [`连续${daysSinceLastChat}天未对话`],
          affinityBefore,
          affinityAfter,
        },
      }),
    ])

    decayedCount++
    details.push({
      userCharacterId: uc.id,
      daysSinceLastChat,
      decayAmount: actualDecay,
      affinityBefore,
      affinityAfter,
    })

    console.log(
      `[Affinity Decay] ${uc.character.name} (${uc.id}): ${affinityBefore} -> ${affinityAfter} ` +
      `(-${actualDecay}, 连续${daysSinceLastChat}天未对话, 已衰减${alreadyDecayed + actualDecay}/${MAX_DECAY})`
    )
  }

  return {
    processed: processedCount,
    decayed: decayedCount,
    details,
  }
}

/**
 * 获取即将衰减的提醒列表
 * 用于主动消息功能：优先给即将衰减的高好感度用户发送提醒
 */
export async function getUpcomingDecayList(
  thresholdDays: number = 6
): Promise<
  Array<{
    userCharacterId: string
    userId: string
    characterId: string
    characterName: string
    currentAffinity: number
    daysSinceLastChat: number
  }>
> {
  const userCharacters = await prisma.userCharacter.findMany({
    where: {
      lastChatAt: {
        not: null,
      },
      affinity: {
        gte: 60, // 只提醒高好感度（亲密期及以上）
      },
    },
    include: {
      character: true,
    },
    orderBy: {
      affinity: "desc",
    },
  })

  const now = new Date()
  const result = []

  for (const uc of userCharacters) {
    if (!uc.lastChatAt) continue

    const daysSinceLastChat = Math.floor(
      (now.getTime() - uc.lastChatAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // 即将达到衰减阈值（6天，还差1天）
    if (daysSinceLastChat >= thresholdDays && daysSinceLastChat < DECAY_START_DAYS) {
      result.push({
        userCharacterId: uc.id,
        userId: uc.userId,
        characterId: uc.characterId,
        characterName: uc.character.name,
        currentAffinity: uc.affinity,
        daysSinceLastChat,
      })
    }
  }

  return result
}
