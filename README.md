# 纸片人男友 2.0 (Paper Boyfriend 2.0)

以角色陪伴为核心的轻量级 Web 产品。内置 6 位差异化人设的虚拟男友，提供有真实性格、外貌一致、可记忆陪伴、关系可演进的对话体验。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS 4 + shadcn/ui
- **数据库**: PostgreSQL (Neon / Vercel Postgres) + Prisma
- **认证**: 自建邮箱注册登录 (bcrypt + jose JWT Session)
- **AI**: DeepSeek (对话 + 情绪分析 + 记忆抽取)
- **图像**: Seedream (文生图 + 图生图)
- **存储**: Vercel Blob
- **部署**: Vercel

## 本地开发

### 环境要求

- Node.js 18+
- pnpm
- PostgreSQL 数据库

### 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入真实 API Key 和数据库连接

# 3. 初始化数据库
pnpm db:push

# 4. 写入角色数据
pnpm db:seed

# 5. 启动开发服务器
pnpm dev
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `DEEPSEEK_BASE_URL` | DeepSeek API 地址（默认 https://api.deepseek.com） |
| `SEEDREAM_API_KEY` | Seedream 图像生成 API Key |
| `SEEDREAM_BASE_URL` | Seedream API 地址 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token |
| `SESSION_SECRET` | JWT Session 加密密钥（32+ 字符） |
| `NEXT_PUBLIC_APP_URL` | 应用公开地址 |

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

## 内置角色

首版内置 6 位角色，全部默认开放：

| 角色 | 年龄 | 职业 | 主题色 |
|------|------|------|--------|
| 林屿 | 26 | 独立游戏开发者 | `#7B8FA1` |
| 顾昭 | 32 | 心外科医生 | `#2C3E50` |
| 陈牧 | 23 | 大学生/乐队主唱 | `#F4A261` |
| 白夜 | 28 | 古籍修复师 | `#A68A64` |
| 霍砺 | 30 | 退役特种兵 | `#1A1A1A` |
| 夏知 | 25 | 烘焙师 | `#F7C8A8` |

完整人设见 `docs/角色系统设计文档（v1.2 最终版）.txt`

## 核心功能

- ✅ 邮箱注册/登录（bcrypt + HTTP-only Cookie Session）
- ✅ 6 位角色选择与详情展示
- ✅ 多角色切换（独立保存消息、记忆、好感度）
- ✅ AI 对话（基于角色人设的 System Prompt）
- ✅ 角色照片（图生图，外貌一致性保证）
- ✅ 情感系统（5 档阶段：疏离→热恋）
- ✅ 照片概率门（阶段越低发照片越少）
- ✅ 用户记忆画像（按角色隔离）
- ✅ 情绪分析与好感度动态调整

## 项目结构

```
src/
├── app/
│   ├── (auth)/login/     # 登录页
│   ├── (auth)/register/  # 注册页
│   ├── (main)/characters/    # 角色列表 + 详情
│   ├── (main)/chat/[characterId]/  # 对话页
│   ├── (main)/settings/  # 设置页
│   └── api/chat/[characterId]/    # 对话 API
├── components/
│   ├── ui/               # 基础 UI 组件
│   └── chat/             # 聊天组件
├── lib/
│   ├── affinity/         # 情感系统
│   ├── ai/               # 外部 AI 封装
│   ├── auth/             # 认证
│   ├── characters/       # 角色查询
│   ├── db/               # 数据库
│   ├── memory/           # 记忆功能
│   └── prompts/          # Prompt 模板
└── proxy.ts              # 路由保护
```

## 部署

### Vercel 部署步骤

1. 将仓库推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（参考 .env.example）
4. 部署完成后执行 `pnpm db:seed` 写入角色数据及生成基准照片

## 文档

- [产品规格说明书](docs/纸片人男友%202.0%20—%20产品规格说明书%20SPEC（v1.2）.txt)
- [角色系统设计](docs/角色系统设计文档（v1.2%20最终版）.txt)
- [情感系统设计](docs/情感系统设计文档（v1.2%20最终版）.txt)
- [项目 Skill 规范](docs/纸片人男友%202.0%20—%20项目专属%20Skill（1.2）.txt)
