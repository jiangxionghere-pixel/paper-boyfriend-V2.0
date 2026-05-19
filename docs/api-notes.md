# 外部 API 调试笔记

> 本文档记录项目使用的外部 API 的接入方式、参数配置、常见问题及解决方案。
> 
> **重要原则**：任何外部 API 在写代码前，必须先在 Postman 中验通。

---

## 目录

1. [LLM API](#一-llm-api)
2. [图像生成 API](#二-图像生成-api)
3. [TTS API（可选）](#三-tts-api可选)
4. [邮件 API（可选）](#四-邮件-api可选)
5. [Postman Collection 规范](#五-postman-collection-规范)

---

## 一、 LLM API

### 1.1 DeepSeek（推荐）

**官方文档**: https://platform.deepseek.com/api-docs

#### 对话 API

```http
POST https://api.deepseek.com/chat/completions
Content-Type: application/json
Authorization: Bearer {DEEPSEEK_API_KEY}

{
  "model": "deepseek-chat",
  "messages": [
    {"role": "system", "content": "系统 Prompt"},
    {"role": "user", "content": "用户消息"}
  ],
  "temperature": 0.7,
  "max_tokens": 800,
  "stream": false
}
```

**响应格式**:

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "deepseek-chat",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "角色回复内容"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 50,
    "total_tokens": 150
  }
}
```

#### 小模型 API（情绪分析/记忆抽取）

```http
POST https://api.deepseek.com/chat/completions
Content-Type: application/json
Authorization: Bearer {DEEPSEEK_API_KEY}

{
  "model": "deepseek-chat",
  "messages": [
    {"role": "system", "content": "你是一个情绪分析助手..."},
    {"role": "user", "content": "分析这段对话..."}
  ],
  "temperature": 0.3,
  "max_tokens": 200,
  "response_format": {"type": "json_object"}
}
```

**调试要点**:

- `temperature`: 对话建议 0.7，分析任务建议 0.3
- `response_format`: 需要 JSON 输出时设置
- 流式输出：`stream: true`（前端实时显示需要）

---

### 1.2 OpenAI

**官方文档**: https://platform.openai.com/docs

#### 对话 API

```http
POST https://api.openai.com/v1/chat/completions
Content-Type: application/json
Authorization: Bearer {OPENAI_API_KEY}

{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "系统 Prompt"},
    {"role": "user", "content": "用户消息"}
  ],
  "temperature": 0.7,
  "max_tokens": 800
}
```

#### 小模型 API

```http
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer {OPENAI_API_KEY}

{
  "model": "gpt-4o-mini",
  "messages": [...],
  "temperature": 0.3,
  "response_format": {"type": "json_object"}
}
```

**调试要点**:

- `gpt-4o-mini` 成本低，适合情绪分析和记忆抽取
- 注意 rate limit，生产环境建议加请求队列

---

### 1.3 Anthropic Claude

**官方文档**: https://docs.anthropic.com/claude/reference

```http
POST https://api.anthropic.com/v1/messages
Content-Type: application/json
x-api-key: {ANTHROPIC_API_KEY}
anthropic-version: 2023-06-01

{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 800,
  "system": "系统 Prompt",
  "messages": [
    {"role": "user", "content": "用户消息"}
  ]
}
```

**调试要点**:

- Claude 对角色扮演效果较好，但 API 响应格式与 OpenAI 不同
- `system` 参数在请求体顶层，不在 messages 数组中

---

## 二、 图像生成 API

### 2.1 Seedream（推荐）

**官方文档**: 请参考 Seedream 官方提供的 API 文档

#### 文生图（Seed 阶段）

```http
POST {SEEDREAM_BASE_URL}/v1/images/generations
Content-Type: application/json
Authorization: Bearer {SEEDREAM_API_KEY}

{
  "prompt": "A 26-year-old East Asian man, slim build...",
  "size": "1024x1536",
  "n": 1,
  "response_format": "url"
}
```

**响应格式**:

```json
{
  "created": 1234567890,
  "data": [{
    "url": "https://cdn.seedream.com/images/xxx.png"
  }]
}
```

#### 图生图（对话中使用）

```http
POST {SEEDREAM_BASE_URL}/v1/images/edits
Content-Type: multipart/form-data
Authorization: Bearer {SEEDREAM_API_KEY}

{
  "image": "基准图片 URL 或文件",
  "prompt": "Scene: 深夜书桌前的电脑屏幕. Style: cinematic photography...",
  "size": "1024x1536",
  "n": 1
}
```

**调试要点**:

- **必须传入基准图片**：确保角色外貌一致性
- Prompt 结构：`[外貌描述] + Scene + Style + Quality`
- 建议尺寸：竖版 1024x1536 或 1024x1365
- 生成时间：通常 5-15 秒，需要前端 loading 状态

---

### 2.2 Nano Banana

**官方文档**: 请参考 Nano Banana 官方文档

```http
POST https://api.nano-banana.com/v1/generate
Content-Type: application/json
Authorization: Bearer {NANO_BANANA_API_KEY}

{
  "prompt": "场景描述",
  "reference_image": "基准图片 URL",
  "width": 1024,
  "height": 1536,
  "num_images": 1
}
```

---

## 三、 TTS API（可选）

### 3.1 ElevenLabs

**官方文档**: https://docs.elevenlabs.io/api-reference/text-to-speech

```http
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Content-Type: application/json
xi-api-key: {ELEVENLABS_API_KEY}

{
  "text": "要转换的文本",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}
```

**推荐音色**:

| 角色 | 推荐 Voice ID | 理由 |
|------|---------------|------|
| 林屿 | Adam | 温和内敛 |
| 顾昭 | Antoni | 成熟低沉 |
| 陈牧 | Josh | 阳光活力 |
| 白夜 | Thomas | 温润文雅 |
| 霍砺 | Clyde | 低沉强势 |
| 夏知 | Daniel | 温暖治愈 |

---

### 3.2 Minimax

**官方文档**: https://api.minimax.chat/

```http
POST https://api.minimax.chat/v1/t2a_v2
Content-Type: application/json
Authorization: Bearer {MINIMAX_API_KEY}

{
  "model": "speech-01-turbo",
  "text": "要转换的文本",
  "voice_id": "male-qn-qingse"
}
```

---

## 四、 邮件 API（可选）

### 4.1 Resend

**官方文档**: https://resend.com/docs/api-reference/emails/send-email

```http
POST https://api.resend.com/emails
Content-Type: application/json
Authorization: Bearer {RESEND_API_KEY}

{
  "from": "noreply@yourdomain.com",
  "to": "user@example.com",
  "subject": "主题",
  "html": "<p>HTML 内容</p>"
}
```

**使用场景**:

- 用户注册验证邮件
- 密码重置邮件
- 角色主动发消息提醒（进阶项）

---

## 五、 Postman Collection 规范

### 5.1 目录结构

```
docs/postman/
├── Paper Boyfriend 2.0 API Collection.json
└── environments/
    ├── Local.postman_environment.json
    └── Production.postman_environment.json
```

### 5.2 必须验证的接口

在写代码前，必须先在 Postman 中验证以下接口：

#### LLM 接口

- [ ] DeepSeek Chat Completions
- [ ] DeepSeek Chat Completions (JSON Mode)
- [ ] OpenAI Chat Completions (备用)
- [ ] Claude Messages (备用)

#### 图像接口

- [ ] Seedream Text-to-Image
- [ ] Seedream Image-to-Image
- [ ] 图像上传至 Vercel Blob

#### 其他

- [ ] Resend Send Email

### 5.3 环境变量模板

```json
{
  "name": "Paper Boyfriend Local",
  "values": [
    {
      "key": "DEEPSEEK_API_KEY",
      "value": "your-key-here",
      "type": "secret"
    },
    {
      "key": "DEEPSEEK_BASE_URL",
      "value": "https://api.deepseek.com"
    },
    {
      "key": "SEEDREAM_API_KEY",
      "value": "your-key-here",
      "type": "secret"
    },
    {
      "key": "SEEDREAM_BASE_URL",
      "value": "https://api.seedream.com"
    }
  ]
}
```

---

## 六、 常见问题

### Q1: LLM 回复不符合角色人设

**排查步骤**:

1. 检查 System Prompt 是否正确注入所有字段
2. 检查情感状态段落是否正确生成
3. 检查 temperature 是否过高（建议 0.6-0.8）
4. 在 Postman 中测试简化版 Prompt

### Q2: 图生图角色外貌不一致

**排查步骤**:

1. 确认基准图片 URL 可访问
2. 检查 appearancePrompt 是否完整传入
3. 检查参考图权重参数
4. 尝试降低场景描述的权重

### Q3: API 响应慢

**优化方案**:

1. 启用流式输出（stream: true）
2. 减小 max_tokens
3. 使用更快的模型（如 gpt-4o-mini 替代 gpt-4o）
4. 添加前端 loading 状态

### Q4: Rate Limit 超限

**解决方案**:

1. 实现请求队列和重试机制
2. 使用多个 API Key 轮询
3. 降级到备用模型
4. 添加用户提示"服务繁忙，请稍后再试"

---

## 七、 调试工具

### 7.1 推荐工具

| 工具 | 用途 |
|------|------|
| Postman | API 调试、Collection 管理 |
| curl | 快速命令行测试 |
| Vercel Logs | 生产环境日志查看 |
| Prisma Studio | 数据库数据查看 |

### 7.2 本地调试命令

```bash
# 测试 DeepSeek API
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# 查看数据库
pnpm db:studio
```

---

*文档版本: v1.0*
*最后更新: 2026-05-20*
