# 纸片人男友 2.0 (Paper Boyfriend 2.0)

> 以角色陪伴为核心的轻量级 Web 产品。内置 6 位差异化人设的虚拟男友，提供有真实性格、外貌一致、可记忆陪伴、关系可演进的对话体验。

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)

---

## 目录

1. [项目简介](#项目简介)
2. [技术栈](#技术栈)
3. [快速开始](#快速开始)
4. [环境变量](#环境变量)
5. [内置角色](#内置角色)
6. [核心功能](#核心功能)
7. [项目结构](#项目结构)
8. [文档](#文档)
9. [部署](#部署)
10. [开发规范](#开发规范)

---

## 项目简介

纸片人男友 2.0 是一款 AI 虚拟陪伴类 Web 产品，核心特点：

- **6 位差异化角色**：每位角色有完整的人设、说话风格、情感参数
- **外貌一致性**：所有照片基于基准图片做图生图，确保角色形象一致
- **角色隔离记忆**：每位角色只记住与用户的专属对话内容
- **情感系统**：5 档关系阶段（疏离→热恋），影响角色行为和照片发送频率
- **多角色切换**：用户可同时与多位角色建立关系，独立保存进度

---

## 技术栈

### 前端与框架
- **框架**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/) (严格模式)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **图标**: [lucide-react](https://lucide.dev/)

### 后端与数据
- **数据库**: [PostgreSQL](https://www.postgresql.org/) (Neon / Vercel Postgres)
- **ORM**: [Prisma](https://www.prisma.io/)
- **认证**: 自建邮箱注册登录 (bcrypt + jose JWT Session)
- **存储**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

### AI 与外部服务
- **对话 LLM**: DeepSeek / OpenAI GPT-4o / Anthropic Claude
- **小模型**: DeepSeek-Chat / GPT-4o-mini (情绪分析 + 记忆抽取)
- **图像生成**: Seedream / Nano Banana (文生图 + 图生图)
- **邮件服务**: Resend (可选)

### 部署
- **平台**: [Vercel](https://vercel.com/)
- **定时任务**: Vercel Cron (可选)

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 8+
- PostgreSQL 数据库 (本地或云端)

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/paper-boyfriend-v2.git
cd paper-boyfriend-v2

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入真实 API Key 和数据库连接

# 4. 初始化数据库
pnpm db:push

# 5. 写入角色数据并生成基准照片
pnpm db:seed

# 6. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000 查看应用。

---

## 环境变量

复制 `.env.example` 到 `.env.local` 并填写以下变量：

### 必需变量

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | [Neon](https://neon.tech/) 或 [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | [DeepSeek Platform](https://platform.deepseek.com/) |
| `SESSION_SECRET` | JWT Session 加密密钥 | 运行 `openssl rand -base64 32` 生成 |
| `NEXT_PUBLIC_APP_URL` | 应用公开地址 | 开发环境用 `http://localhost:3000` |

### 图像生成（必需）

| 变量 | 说明 |
|------|------|
| `SEEDREAM_API_KEY` | Seedream API Key |
| `SEEDREAM_BASE_URL` | Seedream API 地址 |

### 存储（二选一）

| 变量 | 说明 |
|------|------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token |

或 Cloudflare R2:

| 变量 | 说明 |
|------|------|
| `R2_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key |
| `R2_BUCKET_NAME` | R2 Bucket 名称 |
| `R2_PUBLIC_URL` | R2 自定义域名（可选） |

### 可选变量

| 变量 | 说明 | 用途 |
|------|------|------|
| `RESEND_API_KEY` | Resend API Key | 邮件服务 |
| `RESEND_FROM_EMAIL` | 发件人邮箱 | 邮件服务 |
| `CRON_SECRET` | Cron 密钥 | 定时任务验证 |

---

## 内置角色

首版内置 6 位角色，全部默认开放：

| 角色 | 年龄 | 职业 | 性格标签 | 主题色 |
|------|------|------|----------|--------|
| **林屿** | 26 | 独立游戏开发者 | 温柔内敛 · 理性 · 微傲娇 | `#7B8FA1` |
| **顾昭** | 32 | 心外科医生 | 成熟稳重 · 沉静可靠 · 占有欲 | `#2C3E50` |
| **陈牧** | 23 | 大学生/乐队主唱 | 阳光开朗 · 黏人 · 撒娇 | `#F4A261` |
| **白夜** | 28 | 古籍修复师 | 文艺安静 · 慢热 · 温润 | `#A68A64` |
| **霍砺** | 30 | 退役特种兵 | 霸道强势 · 话少 · 占有欲极强 | `#1A1A1A` |
| **夏知** | 25 | 烘焙师 | 软甜治愈 · 体贴细心 · 暖男 | `#F7C8A8` |

完整人设见 [docs/characters.md](docs/characters.md)

---

## 核心功能

### 已实现 ✅

- [x] 邮箱注册/登录（bcrypt + HTTP-only Cookie Session）
- [x] 6 位角色选择与详情展示
- [x] 多角色切换（独立保存消息、记忆、好感度）
- [x] AI 对话（基于角色人设的 System Prompt）
- [x] 角色照片（图生图，外貌一致性保证）
- [x] 情感系统（5 档阶段：疏离→热恋）
- [x] 照片概率门（阶段越低发照片越少）
- [x] 用户记忆画像（按角色隔离）
- [x] 情绪分析与好感度动态调整

### 进阶项（可选）

- [ ] 阶段升级/降级事件提示
- [ ] TTS 语音播放
- [ ] 角色主动发消息

### 挑战项（可选）

- [ ] 好感度日衰减机制
- [ ] 邮件提醒服务
- [ ] 更多角色解锁

---

## 项目结构

```
paper-boyfriend-v2/
├── docs/                          # 项目文档
│   ├── characters.md              # 6位角色完整人设
│   ├── affinity-system.md         # 情感系统设计
│   ├── api-notes.md               # 外部API调试笔记
│   └── postman/                   # Postman Collection
├── prisma/
│   ├── schema.prisma              # 数据库Schema
│   └── seed.ts                    # 角色Seed脚本
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # 认证路由组
│   │   │   ├── login/             # 登录页
│   │   │   └── register/          # 注册页
│   │   ├── (main)/                # 主路由组
│   │   │   ├── characters/        # 角色列表+详情
│   │   │   ├── chat/[characterId]/# 对话页
│   │   │   └── settings/          # 设置页
│   │   ├── api/                   # API路由
│   │   │   ├── auth/              # 认证API
│   │   │   ├── chat/[characterId]/# 对话API
│   │   │   └── characters/        # 角色API
│   │   ├── layout.tsx             # 根布局
│   │   └── page.tsx               # 首页
│   ├── components/                # React组件
│   │   ├── ui/                    # shadcn/ui组件
│   │   ├── character/             # 角色相关组件
│   │   └── chat/                  # 聊天相关组件
│   └── lib/                       # 工具库
│       ├── affinity/              # 情感系统
│       │   ├── index.ts           # 统一导出
│       │   ├── stages.ts          # 阶段判定
│       │   ├── prompt.ts          # Prompt生成
│       │   ├── photo-gate.ts      # 照片概率门
│       │   ├── update.ts          # 更新流程
│       │   └── weighting.ts       # 加权计算
│       ├── ai/                    # AI能力封装
│       │   ├── llm.ts             # 对话LLM
│       │   ├── llm-small.ts       # 小模型
│       │   ├── image.ts           # 图生图
│       │   ├── image-seed.ts      # 文生图(seed)
│       │   └── tts.ts             # 语音合成
│       ├── auth/                  # 认证相关
│       ├── characters/            # 角色查询
│       ├── db/                    # 数据库
│       ├── memory/                # 记忆功能
│       └── prompts/               # Prompt模板
│           ├── system.ts          # 系统Prompt
│           ├── emotion.ts         # 情绪分析Prompt
│           ├── memory.ts          # 记忆抽取Prompt
│           └── image.ts           # 图像Prompt
├── .env.example                   # 环境变量模板
├── .env.local                     # 本地环境变量(不提交)
├── next.config.js                 # Next.js配置
├── package.json                   # 项目依赖
├── tailwind.config.ts             # Tailwind配置
├── tsconfig.json                  # TypeScript配置
└── README.md                      # 本文件
```

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/characters.md](docs/characters.md) | 6位角色完整人设（权威来源） |
| [docs/affinity-system.md](docs/affinity-system.md) | 情感系统设计（权威来源） |
| [docs/api-notes.md](docs/api-notes.md) | 外部API调试笔记 |

其他参考文档：
- [产品规格说明书](docs/纸片人男友%202.0%20—%20产品规格说明书%20SPEC（v1.2）.txt)
- [角色系统设计](docs/角色系统设计文档（v1.2%20最终版）.txt)
- [情感系统设计](docs/情感系统设计文档（v1.2%20最终版）.txt)
- [项目 Skill 规范](docs/纸片人男友%202.0%20—%20项目专属%20Skill（1.2）.txt)

---

## 部署

### Vercel 部署

1. **推送代码到 GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **在 Vercel 导入项目**

- 登录 [Vercel](https://vercel.com/)
- 点击 "Add New Project"
- 导入 GitHub 仓库

3. **配置环境变量**

在 Vercel 项目设置中，添加所有必需的环境变量（参考 `.env.example`）。

4. **部署**

点击 "Deploy"，等待构建完成。

5. **初始化数据库**

```bash
# 本地执行，连接生产数据库
DATABASE_URL="your-production-db-url" pnpm db:push
DATABASE_URL="your-production-db-url" pnpm db:seed
```

### 自定义域名（可选）

1. 在 Vercel 项目设置中添加自定义域名
2. 更新 `NEXT_PUBLIC_APP_URL` 环境变量
3. 重新部署

---

## 开发规范

### 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm lint` | 运行 ESLint |
| `pnpm db:push` | 推送 Schema 到数据库 |
| `pnpm db:migrate` | 创建数据库迁移 |
| `pnpm db:seed` | 执行角色 Seed 脚本 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:studio` | 打开 Prisma Studio |

### 代码规范

- **严格模式**: TypeScript `strict: true`
- **命名规范**: 
  - 文件: 小写连字符 (`character-card.tsx`)
  - 组件: 大驼峰 (`CharacterCard`)
  - 函数/变量: 小驼峰 (`getCharacterById`)
- **注释**: 复杂逻辑必须注释，说明"为什么"
- **错误处理**: 所有外部 API 调用必须 `try/catch`

### Git 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

类型:
- `feat`: 新功能
- `fix`: 修复
- `refactor`: 重构
- `docs`: 文档
- `style`: 样式
- `chore`: 杂项

示例:
```bash
git commit -m "feat(character): 实现角色选择页与详情页"
git commit -m "feat(affinity): 接入照片概率门"
git commit -m "fix(chat): 修复切换角色后 themeColor 未更新"
git commit -m "docs(characters): 完善霍砺的成长背景"
```

---

## 许可证

[MIT](LICENSE)

---

## 致谢

- 设计灵感来自各类乙女游戏和视觉小说
- UI 组件来自 [shadcn/ui](https://ui.shadcn.com/)
- 图标来自 [Lucide](https://lucide.dev/)

---

<p align="center">
  Made with ❤️ for virtual companionship
</p>
