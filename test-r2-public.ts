import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import dotenv from "dotenv"
dotenv.config()

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "paper-boyfriend"

async function testR2Public() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("❌ R2 credentials not configured")
    return
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })

  try {
    // 生成预签名 URL（1小时有效）
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: "characters/xia-zhi/baseline.jpg",
    })
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 })
    console.log("✅ Pre-signed URL (valid for 1 hour):")
    console.log(signedUrl)

    // 检查公开 URL
    const publicUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/characters/xia-zhi/baseline.jpg`
    console.log("\n🔍 Public URL:")
    console.log(publicUrl)
    
    // 尝试访问公开 URL
    console.log("\n📡 Testing public URL access...")
    const response = await fetch(publicUrl, { method: "HEAD" })
    console.log(`Status: ${response.status}`)
    if (response.ok) {
      console.log("✅ Public access is enabled!")
    } else {
      console.log("❌ Public access is NOT enabled. You need to:")
      console.log("   1. Go to Cloudflare Dashboard > R2")
      console.log("   2. Select your bucket 'paper-boyfriend'")
      console.log("   3. Go to Settings > Public Access")
      console.log("   4. Enable 'Allow public access'")
      console.log("   Or use a custom domain with public access enabled")
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error("❌ Test failed:", err.message)
  }
}

testR2Public()
