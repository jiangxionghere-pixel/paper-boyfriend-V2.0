import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixTtsSettings() {
  console.log("🔧 修复 TTS 设置...")

  // 将所有用户的 ttsEnabled 重置为 true，ttsMuted 设为 false
  const result = await prisma.userCharacter.updateMany({
    data: {
      ttsEnabled: true,
      ttsMuted: false,
    },
  })

  console.log(`✅ 已修复 ${result.count} 个用户的 TTS 设置`)
  console.log("   ttsEnabled = true (生成语音)")
  console.log("   ttsMuted = false (不静音)")

  await prisma.$disconnect()
}

fixTtsSettings().catch((err) => {
  console.error("❌ 修复失败:", err)
  prisma.$disconnect()
  process.exit(1)
})
