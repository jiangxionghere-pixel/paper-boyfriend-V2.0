import { prisma } from "./src/lib/db/prisma"

async function main() {
  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      baselineImageUrl: true,
      avatarUrl: true,
    },
  })

  console.log("\n=== Character Image URLs ===\n")
  for (const char of characters) {
    console.log(`\n${char.name} (${char.id}):`)
    console.log(`  baselineImageUrl: ${char.baselineImageUrl || "null"}`)
    console.log(`  avatarUrl: ${char.avatarUrl || "null"}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
