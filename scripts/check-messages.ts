import { prisma } from "@/lib/db/prisma"

async function checkMessages() {
  const messages = await prisma.message.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      content: true,
      audioUrl: true,
      createdAt: true,
    },
  })

  console.log("最近10条消息:")
  for (const m of messages) {
    console.log(`\n[${m.role}] ${m.content.slice(0, 30)}...`)
    console.log(`  audioUrl: ${m.audioUrl ? "✅ " + m.audioUrl.slice(0, 60) + "..." : "❌ null"}`)
  }

  await prisma.$disconnect()
}

checkMessages()
