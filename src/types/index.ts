import type { Character, UserCharacter, User, Message, UserProfile, AffinityLog } from "@prisma/client"

export type { Character, UserCharacter, User, Message, UserProfile, AffinityLog }

export type AffinityStage = "疏离期" | "冷淡期" | "平稳期" | "亲密期" | "热恋期"

export interface StageConfig {
  name: AffinityStage
  min: number
  max: number
  photoProbability: number
  promptDescription: string
}

export interface EmotionAnalysisResult {
  delta: number
  reason: string
  triggers: string[]
}

export interface MemoryExtractionResult {
  key: string
  value: string
}

export interface SessionPayload {
  userId: string
  email: string
}

export interface CharacterWithAffinity extends Character {
  affinity: number
  userCharacterId: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  imageUrl: string | null
  createdAt: Date
}
