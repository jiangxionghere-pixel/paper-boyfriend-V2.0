import { prisma } from "@/lib/db/prisma"

export async function getAllCharacters() {
  return prisma.character.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
}

export async function getCharacterById(id: string) {
  return prisma.character.findUnique({
    where: { id },
  })
}

export async function getUserCharacter(userId: string, characterId: string) {
  return prisma.userCharacter.findUnique({
    where: {
      userId_characterId: { userId, characterId },
    },
    include: { character: true },
  })
}

export async function getUserCharacters(userId: string) {
  return prisma.userCharacter.findMany({
    where: { userId },
    include: { character: true },
    orderBy: { selectedAt: "desc" },
  })
}

export async function createUserCharacter(userId: string, characterId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  })

  if (!character) throw new Error("Character not found")

  return prisma.userCharacter.create({
    data: {
      userId,
      characterId,
      affinity: character.initialAffinity,
    },
    include: { character: true },
  })
}

export async function getOrCreateUserCharacter(userId: string, characterId: string) {
  const existing = await getUserCharacter(userId, characterId)
  if (existing) return existing
  return createUserCharacter(userId, characterId)
}
