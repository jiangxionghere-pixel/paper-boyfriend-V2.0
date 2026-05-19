/**
 * 重新生成角色基准照片
 * 统一风格：半身照，柔和自然光，电影感，去除水印
 */

import { PrismaClient } from "@prisma/client"
import { textToImage } from "../src/lib/ai/image"
import { uploadBufferToR2 } from "../src/lib/storage/r2"

const prisma = new PrismaClient()

// 统一的摄影风格前缀
const UNIFIED_STYLE_PREFIX = `Professional portrait photography, upper body shot, chest-up composition, centered framing, soft natural window light, shallow depth of field, warm cinematic color grading, photorealistic, 35mm film aesthetic, clean background, high detail, sharp focus on face, no watermark, no text`

async function regenerateBaselineImages() {
  console.log("🎨 开始重新生成角色基准照片...")
  console.log("=" .repeat(60))

  const characters = await prisma.character.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  for (const char of characters) {
    console.log(`\n📸 生成 ${char.name} 的基准照片...`)

    try {
      // 构建统一风格的 prompt
      const prompt = `${UNIFIED_STYLE_PREFIX}. ${char.appearancePrompt}`

      console.log(`   Prompt: ${prompt.slice(0, 100)}...`)

      // 生成图片（无水印）
      const imageUrl = await textToImage(prompt)
      console.log(`   ✅ 生成成功: ${imageUrl.slice(0, 60)}...`)

      // 下载并上传到 R2
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const fileName = `characters/baseline/${char.id}-${Date.now()}.png`
      const uploadedUrl = await uploadBufferToR2(buffer, fileName, "image/png")

      console.log(`   ✅ 上传成功: ${uploadedUrl.slice(0, 60)}...`)

      // 更新数据库
      await prisma.character.update({
        where: { id: char.id },
        data: { baselineImageUrl: uploadedUrl },
      })

      console.log(`   ✅ ${char.name} 更新完成`)

      // 延迟避免速率限制
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`   ❌ ${char.name} 生成失败:`, error)
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("🎉 基准照片重新生成完成！")

  await prisma.$disconnect()
}

regenerateBaselineImages().catch(console.error)
