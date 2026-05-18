import type { Character } from "@prisma/client"

export function calculateWeightedDelta(
  rawDelta: number,
  character: Character,
  hasMentionedOther: boolean
): number {
  let finalDelta = rawDelta

  if (rawDelta > 0) {
    finalDelta = rawDelta * character.affinityGainRate
  } else if (rawDelta < 0) {
    finalDelta = rawDelta * character.affinityLossRate
  }

  if (hasMentionedOther) {
    finalDelta = finalDelta * character.jealousyFactor
  }

  finalDelta = Math.max(-5, Math.min(5, finalDelta))
  finalDelta = Math.round(finalDelta)

  return finalDelta
}

export function clampAffinity(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}
