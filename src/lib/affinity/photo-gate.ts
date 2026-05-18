import { getAffinityStage, getStageConfig } from "./stages"

export function shouldSendPhoto(affinity: number): boolean {
  const stage = getAffinityStage(affinity)
  const config = getStageConfig(stage)
  const probability = config.photoProbability

  if (probability <= 0) return false
  if (probability >= 1) return true

  return Math.random() < probability
}
