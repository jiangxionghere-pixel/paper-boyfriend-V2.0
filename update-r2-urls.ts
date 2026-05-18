import { prisma } from "./src/lib/db/prisma"
import dotenv from "dotenv"
dotenv.config()

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "paper-boyfriend"

async function updateR2Urls() {
  if (!R2_PUBLIC_URL) {
    console.error("❌ R2_PUBLIC_URL not configured")
    return
  }

  console.log(`🔄 Updating R2 URLs to use: ${R2_PUBLIC_URL}`)

  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      baselineImageUrl: true,
      avatarUrl: true,
    },
  })

  for (const char of characters) {
    console.log(`\n📷 ${char.name} (${char.id}):`)

    // 更新 baselineImageUrl
    if (char.baselineImageUrl?.includes("r2.cloudflarestorage.com")) {
      // 提取路径部分
      const pathMatch = char.baselineImageUrl.match(/r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/)
      if (pathMatch) {
        const path = pathMatch[1]
        const newUrl = `${R2_PUBLIC_URL}/${path}`
        
        await prisma.character.update({
          where: { id: char.id },
          data: { baselineImageUrl: newUrl },
        })
        console.log(`  ✅ baselineImageUrl: ${newUrl}`)
      }
    }

    // 更新 avatarUrl
    if (char.avatarUrl?.includes("r2.cloudflarestorage.com")) {
      const pathMatch = char.avatarUrl.match(/r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/)
      if (pathMatch) {
        const path = pathMatch[1]
        const newUrl = `${R2_PUBLIC_URL}/${path}`
        
        await prisma.character.update({
          where: { id: char.id },
          data: { avatarUrl: newUrl },
        })
        console.log(`  ✅ avatarUrl: ${newUrl}`)
      }
    }
  }

  console.log("\n🎉 All URLs updated!")
}

updateR2Urls()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
