import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  timeout: 30000,
  maxRetries: 2,
})

export interface LLMMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function chatCompletion(
  messages: LLMMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: options?.temperature ?? 0.8,
    max_tokens: options?.maxTokens ?? 1024,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("LLM returned empty response")
  }

  return content
}

export async function smallModelCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number }
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.3,
    max_tokens: 512,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("Small model returned empty response")
  }

  return content
}
