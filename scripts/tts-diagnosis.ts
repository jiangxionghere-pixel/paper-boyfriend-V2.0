import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function diagnoseTTS() {
  console.log("🔍 TTS 功能诊断报告\n")

  // 1. 检查环境变量
  console.log("1️⃣ 环境变量检查:")
  console.log(`   TTS_API_KEY: ${process.env.TTS_API_KEY ? "✅ 已设置" : "❌ 未设置"}`)
  console.log(`   TTS_APP_ID: ${process.env.TTS_APP_ID ? "✅ 已设置" : "❌ 未设置"}`)
  console.log(`   TTS_ACCESS_KEY: ${process.env.TTS_ACCESS_KEY ? "✅ 已设置" : "⚪ 未设置（可选）"}`)
  console.log(`   TTS_SECRET_KEY: ${process.env.TTS_SECRET_KEY ? "✅ 已设置" : "⚪ 未设置（可选）"}`)

  // 2. 检查数据库角色语音配置
  console.log("\n2️⃣ 角色语音配置:")
  const characters = await prisma.character.findMany({
    select: { id: true, name: true, voiceId: true },
    orderBy: { sortOrder: "asc" },
  })

  for (const c of characters) {
    console.log(`   ${c.name}: ${c.voiceId ? `✅ ${c.voiceId}` : "❌ 未设置"}`)
  }

  // 3. 检查消息表中的音频记录
  console.log("\n3️⃣ 历史音频消息统计:")
  const messagesWithAudio = await prisma.message.count({
    where: { audioUrl: { not: null } },
  })
  const totalMessages = await prisma.message.count()
  console.log(`   含音频的消息: ${messagesWithAudio} / ${totalMessages}`)

  // 4. 检查最近的消息
  console.log("\n4️⃣ 最近5条 assistant 消息:")
  const recentMessages = await prisma.message.findMany({
    where: { role: "assistant" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, content: true, audioUrl: true, createdAt: true },
  })

  for (const msg of recentMessages) {
    const hasAudio = msg.audioUrl ? "✅" : "❌"
    console.log(`   ${hasAudio} ${msg.content.slice(0, 40)}...`)
  }

  // 5. 给出建议
  console.log("\n📋 诊断结果:")
  if (!process.env.TTS_API_KEY) {
    console.log("   ❌ TTS_API_KEY 未配置，这是没有语音的主要原因")
    console.log("   💡 解决步骤:")
    console.log("      1. 前往火山引擎官网: https://www.volcengine.com/")
    console.log("      2. 注册账号并开通【语音合成】服务")
    console.log("      3. 创建应用获取 App ID 和 API Key")
    console.log("      4. 将密钥填入 .env.local 文件")
  } else if (characters.some(c => !c.voiceId)) {
    console.log("   ⚠️ 部分角色未配置 voiceId")
    console.log("   💡 运行: npx tsx scripts/update-voice-ids.ts")
  } else {
    console.log("   ✅ 配置看起来正常，如果仍无语音请检查:")
    console.log("      - 火山引擎账户余额是否充足")
    console.log("      - API Key 是否正确")
    console.log("      - 网络连接是否正常")
  }

  await prisma.$disconnect()
}

diagnoseTTS()
