import type { Metadata } from "next"
import { Crimson_Pro, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "纸片人男友 2.0",
  description: "专属灵魂男友，陪你共度朝夕。他记得你的偏爱与心事，懂你的欢喜与低落。",
  keywords: ["AI男友", "虚拟陪伴", "聊天机器人", "情感陪伴", "纸片人男友"],
  authors: [{ name: "Paper Boyfriend" }],
  openGraph: {
    title: "纸片人男友 2.0",
    description: "专属灵魂男友，陪你共度朝夕。他记得你的偏爱与心事，懂你的欢喜与低落。",
    type: "website",
    locale: "zh_CN",
    siteName: "纸片人男友",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "纸片人男友 2.0 - 专属灵魂男友，陪你共度朝夕",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "纸片人男友 2.0",
    description: "专属灵魂男友，陪你共度朝夕。他记得你的偏爱与心事，懂你的欢喜与低落。",
    images: ["/og-image.png"],
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${crimson.variable} ${jetbrainsMono.variable} antialiased gradient-ambient`}>
        {children}
      </body>
    </html>
  )
}
