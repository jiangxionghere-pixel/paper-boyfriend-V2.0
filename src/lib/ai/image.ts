const SEEDREAM_API_KEY = process.env.SEEDREAM_API_KEY || ""
const SEEDREAM_BASE_URL = process.env.SEEDREAM_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3/images/generations"

async function seedreamRequest(body: Record<string, unknown>) {
  const response = await fetch(SEEDREAM_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SEEDREAM_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Seedream API error (${response.status}): ${errorText}`)
  }

  return response.json()
}

export async function textToImage(prompt: string): Promise<string> {
  const result = await seedreamRequest({
    model: "doubao-seedream-5-0-260128",
    prompt,
    sequential_image_generation: "disabled",
    response_format: "url",
    size: "2K",
    stream: false,
    watermark: true,
  })

  return result.data[0].url
}

export async function imageToImage(baseImageUrl: string, prompt: string): Promise<string> {
  const result = await seedreamRequest({
    model: "doubao-seedream-5-0-260128",
    prompt,
    image: baseImageUrl,
    sequential_image_generation: "disabled",
    response_format: "url",
    size: "2K",
    stream: false,
    watermark: true,
  })

  return result.data[0].url
}
