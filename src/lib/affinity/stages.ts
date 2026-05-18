import type { AffinityStage, StageConfig } from "@/types"

export const STAGE_CONFIGS: StageConfig[] = [
  { name: "疏离期", min: 0, max: 19, photoProbability: 0, promptDescription: "疏离" },
  { name: "冷淡期", min: 20, max: 39, photoProbability: 0.2, promptDescription: "冷淡" },
  { name: "平稳期", min: 40, max: 59, photoProbability: 0.7, promptDescription: "平稳" },
  { name: "亲密期", min: 60, max: 79, photoProbability: 0.9, promptDescription: "亲密" },
  { name: "热恋期", min: 80, max: 100, photoProbability: 1.0, promptDescription: "热恋" },
]

export function getAffinityStage(value: number): AffinityStage {
  const clamped = Math.max(0, Math.min(100, value))
  for (const config of STAGE_CONFIGS) {
    if (clamped >= config.min && clamped <= config.max) {
      return config.name
    }
  }
  return "平稳期"
}

export function getStageConfig(stage: AffinityStage): StageConfig {
  return STAGE_CONFIGS.find((s) => s.name === stage) || STAGE_CONFIGS[2]
}

/**
 * 阶段2/3增强：检查是否需要阶段过渡提示
 * 当亲和度跨越阶段边界时，返回目标阶段
 */
export function checkStageTransition(
  affinityBefore: number,
  affinityAfter: number
): AffinityStage | null {
  const stageBefore = getAffinityStage(affinityBefore)
  const stageAfter = getAffinityStage(affinityAfter)

  if (stageBefore !== stageAfter) {
    return stageAfter
  }
  return null
}

/**
 * 获取阶段过渡提示语
 */
export function getStageTransitionPrompt(
  stage: AffinityStage,
  characterName: string
): string {
  const prompts: Record<AffinityStage, string> = {
    疏离期: `${characterName} 对你的态度似乎更加疏远了……`,
    冷淡期: `${characterName} 的态度有些冷淡。`,
    平稳期: `你和 ${characterName} 的关系趋于平稳。`,
    亲密期: `你和 ${characterName} 的关系变得更加亲密了！`,
    热恋期: `${characterName} 对你的感情达到了热恋期！`,
  }
  return prompts[stage] || ""
}
