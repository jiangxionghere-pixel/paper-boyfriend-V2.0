import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 豆包语音合成模型 2.0 音色配置
// 文档: https://www.volcengine.com/docs/6561/1257544
// 2.0 音色后缀: uranus_bigtts (通用) / jupiter_bigtts (端到端)
const VOICE_CONFIGS: Record<string, string> = {
  "lin-yu": "zh_male_m191_uranus_bigtts",     // 林屿 - 温柔内敛 -> 云舟 2.0 (沉稳男声)
  "gu-zhao": "zh_male_taocheng_uranus_bigtts", // 顾昭 - 成熟稳重 -> 小天 2.0 (成熟男声)
  "chen-mu": "zh_male_m191_uranus_bigtts",     // 陈牧 - 阳光开朗 -> 云舟 2.0 (阳光)
  "bai-ye": "zh_male_taocheng_uranus_bigtts",  // 白夜 - 文艺安静 -> 小天 2.0 (温柔)
  "huo-li": "zh_male_m191_uranus_bigtts",      // 霍砺 - 霸道强势 -> 云舟 2.0 (霸气)
  "xia-zhi": "zh_female_vv_uranus_bigtts",     // 夏知 - 软甜治愈 -> Vivi 2.0 (甜美女声)
}

async function updateVoiceIds() {
  console.log("🎙️  Updating character voice IDs for Doubao TTS 2.0...")

  for (const [characterId, voiceId] of Object.entries(VOICE_CONFIGS)) {
    try {
      const character = await prisma.character.update({
        where: { id: characterId },
        data: { voiceId },
      })
      console.log(`  ✅ ${character.name} -> ${voiceId}`)
    } catch (error) {
      console.error(`  ❌ Failed to update ${characterId}:`, error)
    }
  }

  // Verify
  const characters = await prisma.character.findMany({
    select: { id: true, name: true, voiceId: true },
    orderBy: { sortOrder: "asc" },
  })

  console.log("\n📋 Current voice ID status:")
  for (const c of characters) {
    console.log(`  ${c.name}: ${c.voiceId || "❌ Not set"}`)
  }

  await prisma.$disconnect()
}

updateVoiceIds()
