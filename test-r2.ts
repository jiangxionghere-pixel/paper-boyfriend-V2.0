import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3"
import dotenv from "dotenv"
dotenv.config()

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "paper-boyfriend"

async function testR2() {
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
    // 列出 bucket 中的对象
    console.log("📋 Listing objects in bucket...")
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: "characters/",
    })
    const listResult = await client.send(listCommand)
    console.log(`✅ Found ${listResult.Contents?.length || 0} objects:`)
    listResult.Contents?.forEach((obj) => {
      console.log(`  - ${obj.Key} (${obj.Size} bytes)`)
    })

    // 检查特定文件是否存在
    const testKey = "characters/xia-zhi/baseline.jpg"
    console.log(`\n🔍 Checking if ${testKey} exists...`)
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: testKey,
      })
      const headResult = await client.send(headCommand)
      console.log(`✅ File exists! Content-Type: ${headResult.ContentType}`)
    } catch (error: unknown) {
      const err = error as Error
      console.error(`❌ File not found: ${err.message}`)
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error("❌ R2 test failed:", err.message)
  }
}

testR2()
