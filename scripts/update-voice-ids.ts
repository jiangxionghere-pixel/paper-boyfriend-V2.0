import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 豆包语音合成模型 2.0 音色配置
// 文档: https://www.volcengine.com/docs/6561/1257544
const VOICE_CONFIGS: Record<string, string> = {
  "lin-yu": "zh_male_yangguangqingnian_emo_v2_mars_bigtts",   // 林屿 - 温柔内敛 -> 阳光青年(多情感)
  "gu-zhao": "zh_male_jingqiangkanye_emo_mars_bigtts",         // 顾昭 - 成熟稳重 -> 京腔侃爷(多情感)
  "chen-mu": "zh_male_beijingxiaoye_emo_v2_mars_bigtts",       // 陈牧 - 阳光开朗 -> 北京小爷(多情感)
  "bai-ye": "zh_male_yourougongzi_emo_v2_mars_bigtts",         // 白夜 - 文艺安静 -> 优柔公子(多情感)
  "huo-li": "zh_male_aojiaobazong_emo_v2_mars_bigtts",         // 霍砺 - 霸道强势 -> 傲娇霸总(多情感)
  "xia-zhi": "zh_female_roumeinvyou_emo_v2_mars_bigtts",       // 夏知 - 软甜治愈 -> 柔美女友(多情感)
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
