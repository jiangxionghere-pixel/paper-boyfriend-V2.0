import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/prisma"
import { getCurrentUser } from "@/app/actions/auth"
import SettingsClient from "./SettingsClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const userCharacters = await prisma.userCharacter.findMany({
    where: { userId: user.id },
    include: { character: true },
    orderBy: { lastChatAt: "desc" },
  })

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      }}
      userCharacters={userCharacters.map((uc) => ({
        id: uc.id,
        character: {
          id: uc.character.id,
          name: uc.character.name,
          occupation: uc.character.occupation,
          themeColor: uc.character.themeColor,
        },
      }))}
    />
  )
}
