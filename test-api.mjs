// 测试 Seedream-5.0 API 连通性
const API_KEY = process.env.SEEDREAM_API_KEY || "d495325f-f89f-4725-9ec0-87022dd2182f"
const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"

async function testSeedreamAPI() {
  console.log("Testing Seedream-5.0 API...")
  console.log("API Key:", API_KEY.slice(0, 10) + "...")

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "doubao-seedream-5-0-260128",
        prompt: "A young East Asian man, portrait photography, soft lighting",
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: true,
      }),
    })

    console.log("Status:", response.status)
    const data = await response.text()
    console.log("Response:", data.slice(0, 500))

    if (response.ok) {
      console.log("\n✅ Seedream API Key is valid!")
    } else {
      console.log("\n❌ API Key invalid")
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message)
  }
}

testSeedreamAPI()
