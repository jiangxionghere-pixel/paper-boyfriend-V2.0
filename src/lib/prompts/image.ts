import type { Character } from "@prisma/client"

export function buildImagePrompt(character: Character, sceneDescription: string): string {
  return `${character.appearancePrompt}

Scene: ${sceneDescription}

Style: cinematic photography, soft natural light, shallow depth of field, warm color tone, photorealistic, 35mm film aesthetic.

Quality: high detail, sharp focus, professional photography, no distortion, no extra limbs, no text, no watermark.`
}
