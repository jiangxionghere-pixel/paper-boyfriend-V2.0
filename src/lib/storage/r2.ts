import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Cloudflare R2 配置
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "paper-boyfriend"
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL // 自定义域名或 R2.dev 链接
const R2_USE_SIGNED_URLS = process.env.R2_USE_SIGNED_URLS === "true" // 是否使用预签名 URL

/**
 * 创建 S3 客户端（兼容 Cloudflare R2）
 */
function createR2Client(): S3Client | null {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("❌ R2 credentials not configured")
    return null
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })
}

/**
 * 上传图片到 Cloudflare R2，返回永久可访问的 URL
 * @param imageUrl 原始图片 URL（如 Seedream 生成的临时 URL）
 * @param path 存储路径，如 "characters/lin-yu/baseline.jpg"
 * @returns 永久 URL
 */
export async function uploadImageToR2(
  imageUrl: string,
  path: string
): Promise<string | null> {
  const client = createR2Client()
  if (!client) {
    console.error("❌ R2 client not initialized")
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
    const buffer = Buffer.from(await blob.arrayBuffer())
    console.log(`  📦 Downloaded: ${(buffer.length / 1024).toFixed(1)} KB`)

    // 上传到 R2
    console.log(`  ☁️ Uploading to R2: ${path}`)
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: blob.type || "image/jpeg",
      // 可选：设置缓存策略
      CacheControl: "public, max-age=31536000", // 1年缓存
    })

    await client.send(command)

    // 构建公开访问 URL
    // Cloudflare R2 公开访问格式: https://{account-id}.r2.cloudflarestorage.com/{bucket}/{path}
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${path}`
      : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${path}`

    console.log(`  ✅ Uploaded to R2: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error("  ❌ Upload to R2 failed:", error)
    return null
  }
}

/**
 * 上传 Buffer 到 Cloudflare R2
 * @param buffer 图片 Buffer
 * @param path 存储路径
 * @param contentType MIME 类型
 * @returns 永久 URL
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  path: string,
  contentType: string = "image/jpeg"
): Promise<string | null> {
  const client = createR2Client()
  if (!client) {
    console.error("❌ R2 client not initialized")
    return null
  }

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    })

    await client.send(command)

    // Cloudflare R2 公开访问格式: https://{account-id}.r2.cloudflarestorage.com/{bucket}/{path}
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${path}`
      : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${path}`

    console.log(`  ✅ Uploaded to R2: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error("  ❌ Upload to R2 failed:", error)
    return null
  }
}

/**
 * 获取 R2 图片的预签名 URL（用于私有 bucket）
 * @param path 存储路径
 * @param expiresIn 过期时间（秒），默认 7 天
 * @returns 预签名 URL
 */
export async function getSignedImageUrl(
  path: string,
  expiresIn: number = 604800 // 7 天
): Promise<string | null> {
  const client = createR2Client()
  if (!client) {
    console.error("❌ R2 client not initialized")
    return null
  }

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
    })
    const signedUrl = await getSignedUrl(client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error("  ❌ Failed to generate signed URL:", error)
    return null
  }
}

/**
 * 检查 URL 是否已经是 R2 的永久链接
 */
export function isR2Url(url: string): boolean {
  if (!url) return false
  if (R2_PUBLIC_URL) {
    return url.includes(R2_PUBLIC_URL)
  }
  return url.includes(".r2.cloudflarestorage.com")
}

/**
 * 从 R2 URL 中提取路径
 */
export function extractR2Path(url: string): string | null {
  if (!url) return null
  
  // 处理预签名 URL
  if (url.includes("?X-Amz-Algorithm")) {
    url = url.split("?")[0]
  }
  
  // 处理公开 URL 格式: https://{account-id}.r2.cloudflarestorage.com/{bucket}/{path}
  const match = url.match(/r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/)
  if (match) {
    return match[1]
  }
  
  return null
}
