import { NextRequest, NextResponse } from "next/server"
import { getSignedImageUrl, extractR2Path } from "@/lib/storage/r2"

/**
 * 获取 R2 图片的预签名 URL
 * GET /api/images?url=<r2-url>
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  // 检查是否是 R2 URL
  if (!url.includes("r2.cloudflarestorage.com")) {
    // 不是 R2 URL，直接返回原 URL
    return NextResponse.json({ url })
  }

  // 从 URL 中提取路径
  const path = extractR2Path(url)
  if (!path) {
    return NextResponse.json({ error: "Invalid R2 URL" }, { status: 400 })
  }

  // 生成预签名 URL（7天有效）
  const signedUrl = await getSignedImageUrl(path, 604800)
  
  if (!signedUrl) {
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
  }

  return NextResponse.json({ url: signedUrl })
}
