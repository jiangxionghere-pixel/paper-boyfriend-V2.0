import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 豆包 seed-tts-1.0 支持的完整音色ID（男声）
// 文档: https://www.volcengine.com/docs/6561/1329505
const VOICE_UPDATES = [
  { id: "lin-yu", voiceId: "zh_male_yangguangqingnian_emo_v2_mars_bigtts" },   // 阳光青年-情感版（温柔内敛）
  { id: "gu-zhao", voiceId: "zh_male_m191_uranus_bigtts" },                      // 云舟（成熟稳重）
  { id: "chen-mu", voiceId: "zh_male_taocheng_uranus_bigtts" },                  // 陶成（阳光开朗）
  { id: "bai-ye", voiceId: "zh_male_yangguangqingnian_emo_v2_mars_bigtts" },     // 阳光青年-情感版（文艺温润）
  { id: "huo-li", voiceId: "zh_male_m191_uranus_bigtts" },                       // 云舟（霸道强势）
  { id: "xia-zhi", voiceId: "zh_male_taocheng_uranus_bigtts" },                  // 陶成（软甜治愈）
]

async function updateVoiceIds() {
  console.log("🎙️ 更新角色音色配置...")
  console.log("资源ID: seed-tts-1.0")
  console.log("")

  for (const update of VOICE_UPDATES) {
    await prisma.character.update({
      where: { id: update.id },
      data: { voiceId: update.voiceId },
    })
    console.log(`✅ ${update.id} → ${update.voiceId}`)
  }

  console.log("\n🎉 所有角色音色已更新！")
  console.log("⚠️  请重新部署到 Vercel 使更改生效")
  await prisma.$disconnect()
}

updateVoiceIds().catch((err) => {
  console.error("❌ 更新失败:", err)
  prisma.$disconnect()
  process.exit(1)
})
