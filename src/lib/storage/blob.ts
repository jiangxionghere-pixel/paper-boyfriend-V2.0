import { put } from "@vercel/blob"

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

/**
 * 上传图片到 Vercel Blob，返回永久可访问的 URL
 * @param imageUrl 原始图片 URL（如 Seedream 生成的临时 URL）
 * @param path 存储路径，如 "characters/lin-yu/baseline.jpg"
 * @returns 永久 URL
 */
export async function uploadImageToBlob(
  imageUrl: string,
  path: string
): Promise<string | null> {
  if (!BLOB_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN not set")
    return null
  }

  try {
    // 下载图片
    console.log(`  📥 Downloading image from ${imageUrl.slice(0, 60)}...`)
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`  ❌ Failed to download image: ${response.status}`)
      return null
    }

    const blob = await response.blob()
    console.log(`  📦 Downloaded: ${(blob.size / 1024).toFixed(1)} KB`)

    // 上传到 Vercel Blob
    console.log(`  ☁️ Uploading to Blob: ${path}`)
    const { url } = await put(path, blob, {
      access: "public",
      token: BLOB_TOKEN,
    })

    console.log(`  ✅ Uploaded: ${url}`)
    return url
  } catch (error) {
    console.error("  ❌ Upload to Blob failed:", error)
    return null
  }
}

/**
 * 上传 Buffer 到 Vercel Blob
 * @param buffer 图片 Buffer
 * @param path 存储路径
 * @param contentType MIME 类型
 * @returns 永久 URL
 */
export async function uploadBufferToBlob(
  buffer: Buffer,
  path: string,
  contentType: string = "image/jpeg"
): Promise<string | null> {
  if (!BLOB_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN not set")
    return null
  }

  try {
    const { url } = await put(path, buffer, {
      access: "public",
      token: BLOB_TOKEN,
      contentType,
    })

    console.log(`  ✅ Uploaded: ${url}`)
    return url
  } catch (error) {
    console.error("  ❌ Upload to Blob failed:", error)
    return null
  }
}
