import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 豆包 TTS 2.0 支持的音色列表
const VOICE_UPDATES = [
  { id: "lin-yu", voiceId: "zh_male_mars_bigtts" },
  { id: "gu-zhao", voiceId: "zh_male_mars_bigtts" },
  { id: "chen-mu", voiceId: "zh_male_mars_bigtts" },
  { id: "bai-ye", voiceId: "zh_male_mars_bigtts" },
  { id: "huo-li", voiceId: "zh_male_mars_bigtts" },
  { id: "xia-zhi", voiceId: "zh_male_mars_bigtts" },
]

async function updateVoiceIds() {
  console.log("🎙️ 更新角色音色配置...")

  for (const update of VOICE_UPDATES) {
    await prisma.character.update({
      where: { id: update.id },
      data: { voiceId: update.voiceId },
    })
    console.log(`✅ ${update.id} → ${update.voiceId}`)
  }

  console.log("\n🎉 所有角色音色已更新！")
  await prisma.$disconnect()
}

updateVoiceIds().catch((err) => {
  console.error("❌ 更新失败:", err)
  prisma.$disconnect()
  process.exit(1)
})
