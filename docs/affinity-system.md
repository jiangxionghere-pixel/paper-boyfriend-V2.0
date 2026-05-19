# 情感系统设计文档（v1.2 最终版）

> **本文档是情感系统（Affinity System）的唯一权威来源。** 所有涉及好感度计算、阶段判定、照片概率门的代码必须严格基于本文档。
>
> 严禁在业务代码中硬编码情感参数；所有参数必须从数据库读取，而数据库的内容来源于 `docs/characters.md`。

---

## 目录

1. [设计目标](#一设计目标)
2. [核心概念](#二核心概念)
3. [5 档情感阶段](#三5-档情感阶段)
4. [数据流与触发时机](#四数据流与触发时机)
5. [情绪分析设计](#五情绪分析设计)
6. [加权计算与防刷分](#六加权计算与防刷分)
7. [双通道作用机制](#七双通道作用机制)
8. [UI 展示约束](#八ui-展示约束)
9. [模块封装规范](#九模块封装规范)
10. [性能与成本控制](#十性能与成本控制)
11. [灰度路线](#十一灰度路线)
12. [与其他模块的协作关系](#十二与其他模块的协作关系)
13. [验收清单](#十三验收清单)
14. [版本与维护](#十四版本与维护)

---

## 一、设计目标

### 1.1 核心定位

情感系统是"不可见的游戏机制"——用户无法直接看到数值或进度条，但能通过角色的行为变化感知关系的演进。

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **不可见性** | 不在任何 UI 展示好感度数值或阶段名称 |
| **可感知性** | 通过角色回复风格、主动性、照片发送频率体现差异 |
| **角色差异化** | 6 位角色对同样的用户输入应有不同反应 |
| **防刷分** | 避免用户通过重复输入快速刷高好感度 |
| **容错性** | 情绪分析失败不影响主对话流程 |

---

## 二、核心概念

### 2.1 Affinity（好感度）

- 范围：**0-100 整数**
- 每位用户与每位角色独立维护一个 affinity 值
- 存储在 `UserCharacter.affinity` 字段

### 2.2 角色情感参数

每个角色有 5 个情感参数（定义在 `docs/characters.md`）：

| 参数 | 说明 | 典型范围 |
|------|------|----------|
| `initialAffinity` | 初始好感度 | 35-60 |
| `affinityGainRate` | 好感度上涨倍率 | 0.6-1.5 |
| `affinityLossRate` | 好感度下降倍率 | 0.5-1.5 |
| `thawThreshold` | "解冻"阈值 | 40-75 |
| `jealousyFactor` | 吃醋强度系数 | 0.6-1.8 |

### 2.3 双通道作用

情感系统通过两个通道作用于角色表现：

- **通道 A**：系统 Prompt 注入"当前情感状态"段落
- **通道 B**：照片概率门，控制 `[SEND_PHOTO]` 标记是否真正执行

---

## 三、5 档情感阶段

### 3.1 阶段划分

| 阶段 | 数值范围 | 名称 | 角色表现特征 |
|------|----------|------|--------------|
| Stage 0 | 0-19 | 疏离期 | 回复简短、礼貌但疏离，几乎不主动 |
| Stage 1 | 20-39 | 冷淡期 | 回复正常但克制，偶尔主动关心 |
| Stage 2 | 40-59 | 平稳期 | 回复自然，会主动分享日常 |
| Stage 3 | 60-79 | 亲密期 | 回复热情，经常使用亲昵称呼 |
| Stage 4 | 80-100 | 热恋期 | 回复长且主动，表达强烈依恋 |

### 3.2 阶段判定函数

```typescript
function getAffinityStage(value: number): Stage {
  if (value <= 19) return Stage.DISTANT;      // 疏离期
  if (value <= 39) return Stage.COLD;         // 冷淡期
  if (value <= 59) return Stage.STABLE;       // 平稳期
  if (value <= 79) return Stage.CLOSE;        // 亲密期
  return Stage.PASSIONATE;                    // 热恋期
}
```

---

## 四、数据流与触发时机

### 4.1 触发时机

每轮对话结束后**异步触发**（与记忆抽取并行）：

1. 用户发送消息
2. 主 LLM 生成回复
3. 返回回复给用户（不等待情感分析）
4. **后台异步执行**：情绪分析 → 加权计算 → 写入数据库

### 4.2 数据流图

```
用户消息 ──┬──→ 主 LLM ──→ 用户收到回复
           │
           └──→ 情绪分析小模型 ──→ 原始 delta ──┬──→ 加权计算 ──→ 新 affinity
                                                │
           角色参数 (gainRate/lossRate/         └──→ 写入 AffinityLog
           jealousyFactor/thawThreshold)
```

### 4.3 数据库存储

**UserCharacter 表：**

```prisma
model UserCharacter {
  id        String   @id @default(cuid())
  userId    String
  characterId String
  affinity  Int      @default(0)  // 0-100
  // ... 其他字段
}
```

**AffinityLog 表（审计日志）：**

```prisma
model AffinityLog {
  id              String   @id @default(cuid())
  userCharacterId String
  oldValue        Int
  newValue        Int
  delta           Int
  reason          String   // 情绪分析结果摘要
  triggers        String[] // 触发标签数组
  createdAt       DateTime @default(now())
}
```

---

## 五、情绪分析设计

### 5.1 分析目标

识别本轮对话中用户的情绪投入程度，输出结构化结果：

```typescript
interface EmotionAnalysis {
  rawDelta: number;        // -5 到 +5 的整数
  triggers: string[];      // 触发标签数组
  reasoning: string;       // 分析理由（用于日志）
}
```

### 5.2 触发标签（Triggers）

| 标签 | 说明 | 典型 rawDelta |
|------|------|---------------|
| `分享日常` | 用户分享生活琐事 | +1 |
| `表达关心` | 用户询问角色状况 | +2 |
| `深度分享` | 用户分享情感/秘密 | +3 |
| `主动邀约` | 用户表达想见角色 | +2 |
| `表达好感` | 用户直接表达喜欢 | +3 |
| `敷衍回复` | 用户回复简短敷衍 | -1 |
| `负面情绪` | 用户表达不满/生气 | -2 |
| `提到他人` | 用户提到第三方 | -1（可能触发吃醋）|
| `拒绝/否定` | 用户拒绝角色提议 | -3 |

### 5.3 情绪分析 Prompt

```typescript
// src/lib/prompts/emotion.ts
export const emotionAnalysisPrompt = `
你是一位情绪分析专家。请分析用户在本轮对话中的情绪投入程度。

用户消息：{{userMessage}}
角色回复：{{assistantMessage}}
当前阶段：{{currentStage}}

请输出 JSON 格式：
{
  "rawDelta": number,      // -5 到 +5
  "triggers": string[],    // 触发标签数组
  "reasoning": string      // 分析理由
}

评分标准：
- +5：极度热情，表达强烈好感或深度情感分享
- +3：明显积极，主动关心或分享重要事情
- +1：轻微积极，正常回复略有温度
- 0：中性，普通对话
- -1：轻微消极，敷衍或简短回复
- -3：明显消极，表达不满或负面情绪
- -5：极度消极，强烈拒绝或攻击
`;
```

---

## 六、加权计算与防刷分

### 6.1 加权公式

```typescript
// 基础加权
let weightedDelta = rawDelta;
if (rawDelta > 0) {
  weightedDelta = rawDelta * character.affinityGainRate;
} else if (rawDelta < 0) {
  weightedDelta = rawDelta * character.affinityLossRate;
}

// 吃醋额外加权
if (triggers.includes('提到他人')) {
  weightedDelta = weightedDelta * character.jealousyFactor;
}

// 防刷分：单轮上限 ±5
weightedDelta = Math.max(-5, Math.min(5, weightedDelta));

// 计算新值并 clamp
const newAffinity = Math.max(0, Math.min(100, currentAffinity + weightedDelta));
```

### 6.2 角色差异化示例

**场景：用户提到另一个男性朋友**

| 角色 | jealousyFactor | rawDelta | 最终 delta |
|------|----------------|----------|------------|
| 陈牧 | 1.0 | -1 | -1 |
| 霍砺 | 1.8 | -1 | -1.8 ≈ -2 |
| 白夜 | 0.6 | -1 | -0.6 ≈ -1 |

**场景：用户分享了一件开心的事**

| 角色 | affinityGainRate | rawDelta | 最终 delta |
|------|------------------|----------|------------|
| 陈牧 | 1.5 | +3 | +4.5 ≈ +5（被 clamp）|
| 霍砺 | 0.6 | +3 | +1.8 ≈ +2 |
| 林屿 | 1.0 | +3 | +3 |

---

## 七、双通道作用机制

### 7.1 通道 A：系统 Prompt 注入

根据当前 affinity 值，生成"当前情感状态"段落注入系统 Prompt：

```typescript
function buildAffinitySection(
  character: Character,
  affinity: number,
  userName: string
): string {
  const stage = getAffinityStage(affinity);
  
  const stagePrompts = {
    [Stage.DISTANT]: `你和 ${userName} 的关系还很疏远。你保持礼貌但疏离，回复简短，不会主动分享个人生活。`,
    [Stage.COLD]: `你和 ${userName} 的关系正在慢慢建立。你偶尔会关心对方，但仍然有所保留。`,
    [Stage.STABLE]: `你和 ${userName} 的关系已经稳定。你会自然分享日常，主动开启话题。`,
    [Stage.CLOSE]: `你和 ${userName} 的关系很亲密。你会使用亲昵称呼，表达想念和关心。`,
    [Stage.PASSIONATE]: `你和 ${userName} 处于热恋状态。你极度依恋对方，会表达强烈的爱意和占有欲。`
  };
  
  return stagePrompts[stage];
}
```

### 7.2 通道 B：照片概率门

后端解析 LLM 输出的 `[SEND_PHOTO: 场景描述]` 标记时，按当前阶段决定是否真正执行图生图：

| 阶段 | 照片发送概率 | 实现方式 |
|------|--------------|----------|
| 疏离期（0-19） | **0%** | 强制屏蔽，即使 LLM 输出了标记 |
| 冷淡期（20-39） | 20% | 随机数判定 |
| 平稳期（40-59） | 70% | 随机数判定 |
| 亲密期（60-79） | 90% | 随机数判定 |
| 热恋期（80-100） | **100%** | 必定执行 |

```typescript
function shouldSendPhoto(affinity: number): boolean {
  const stage = getAffinityStage(affinity);
  
  const probabilities = {
    [Stage.DISTANT]: 0,
    [Stage.COLD]: 0.2,
    [Stage.STABLE]: 0.7,
    [Stage.CLOSE]: 0.9,
    [Stage.PASSIONATE]: 1.0
  };
  
  return Math.random() < probabilities[stage];
}
```

**重要原则：** 概率门未通过时，用户应无任何感知（不显示"发送失败"等提示）。

---

## 八、UI 展示约束

### 8.1 绝对禁止

- ❌ 禁止在任何页面展示 affinity 数值
- ❌ 禁止展示阶段名称（如"亲密期"）
- ❌ 禁止展示进度条、心形图标等暗示数值的 UI
- ❌ 禁止在设置页展示"关系状态"文字
- ❌ 禁止 API 返回 affinity 字段给前端

### 8.2 允许的表达

- ✅ 角色行为的自然变化（回复长度、主动性、亲昵程度）
- ✅ 照片发送频率的变化
- ✅ 角色主动发消息的频率（进阶项）

---

## 九、模块封装规范

### 9.1 文件位置

```
src/lib/affinity/
├── index.ts          // 对外统一导出
├── stages.ts         // 阶段判定逻辑
├── prompt.ts         // buildAffinitySection
├── photo-gate.ts     // shouldSendPhoto
├── update.ts         // updateAffinity 主流程
└── weighting.ts      // 加权计算与 clamp
```

### 9.2 必须提供的封装函数

```typescript
// 阶段判定
function getAffinityStage(value: number): Stage;

// 生成系统 Prompt 第 7 部分
function buildAffinitySection(
  character: Character,
  affinity: number,
  userName: string
): string;

// 照片概率门判定
function shouldSendPhoto(affinity: number): boolean;

// 异步主流程：情绪分析 → 加权 → 写入 → 日志
async function updateAffinity(
  userCharacterId: string,
  userMsg: string,
  assistantMsg: string
): Promise<void>;
```

### 9.3 强制约束

- 业务代码（如 chat route、聊天 UI）**不允许直接访问** `UserCharacter.affinity`
- 所有读写必须通过封装函数
- 封装函数必须有完整的 TypeScript 类型定义
- 单元测试优先覆盖：加权计算、clamp、阶段判定、概率门

---

## 十、性能与成本控制

### 10.1 异步执行

- 情绪分析使用 **fire-and-forget** 模式
- 用户消息处理完后立即返回回复
- `updateAffinity` 在后台单独执行

### 10.2 模型选择

- 情绪分析使用**小模型**（GPT-4o-mini / Claude Haiku / DeepSeek-Chat）
- 不使用对话主 LLM
- 通过环境变量配置具体模型

### 10.3 频率限制

- 每轮对话触发 1 次情绪分析，不在多轮间累积调用
- 阶段 3 的日衰减由 Cron Job 批量处理，避免实时计算

### 10.4 失败容错

- 情绪分析失败不影响主对话
- 失败时记录错误日志，但不重试（避免雪崩）
- 数据库写入使用事务，确保 affinity 与 AffinityLog 原子性

---

## 十一、灰度路线

### 11.1 阶段 1（MVP，必须实现）

- [ ] 数据库 schema：Character 情感字段 + AffinityLog 表
- [ ] 6 位角色 seed 写入情感参数
- [ ] UserCharacter 创建时用 `character.initialAffinity` 初始化
- [ ] 小模型情绪分析（emotion.ts）
- [ ] 加权计算 + 防刷分 + clamp
- [ ] 写入 AffinityLog
- [ ] 通道 A：系统 Prompt 注入"当前情感状态"段落
- [ ] 通道 B：照片概率门
- [ ] 严格遵守 UI 不展示约束

### 11.2 阶段 2（进阶项）

- [ ] 阶段升级 / 降级事件
- [ ] `UserCharacter.pendingStageTransition` 字段读写
- [ ] 下一次对话时注入一次性"关系变化"提示
- [ ] 提示消费后清空字段

### 11.3 阶段 3（挑战项）

- [ ] Vercel Cron 每日扫描
- [ ] 连续 7 天未对话开始衰减，单次最多 -15
- [ ] 与"角色主动发消息"挑战项联动
- [ ] 优先给高好感度用户发送提醒，避免衰减

---

## 十二、与其他模块的协作关系

### 12.1 与记忆功能的关系

- 记忆功能负责"记住事实"（生日、爱好等具体信息）
- 情感系统负责"记住关系"（用户对角色的态度演进）
- 两者并行异步执行，互不阻塞
- 情绪分析的 Prompt 中可以参考已有的 UserProfile 作为上下文（例如已知用户母亲生病，本轮用户提到母亲应识别为深度分享）

### 12.2 与图生图的关系

- 情感阶段通过通道 B 门控图生图调用
- 高好感度阶段，角色可在 `[SEND_PHOTO: ...]` 中输出更亲密氛围的场景（由 LLM 在通道 A 的影响下自然产生，无需额外处理）

### 12.3 与系统 Prompt 的关系

- 情感状态作为系统 Prompt 的第 7 部分注入
- 严格位于"用户画像注入"之后、"行为边界"之前
- 9 部分的完整顺序参考 SKILL v1.2 第五节

---

## 十三、验收清单

### 13.1 数据流验收

- [ ] UserCharacter 创建时正确使用 `character.initialAffinity` 初始化
- [ ] 每轮对话后 AffinityLog 中能看到 delta 记录
- [ ] affinity 数值始终在 0-100 范围内
- [ ] 情绪分析失败不影响主对话流程
- [ ] 情绪分析与记忆抽取并行执行

### 13.2 差异化验收

- [ ] 6 位角色对同样的用户行为反应有可观察的差异
- [ ] 霍砺与顾昭推进明显比陈牧、夏知慢
- [ ] 白夜对负面情绪反应最迟钝（lossRate 0.6）
- [ ] 霍砺对"提到他人"反应最强烈（jealousyFactor 1.8）

### 13.3 通道 A 验收

- [ ] 不同阶段下角色的回复风格有明显差异
- [ ] 疏离期角色回复短而冷
- [ ] 热恋期角色回复长且主动
- [ ] 角色从不在对话中提及"好感度""阶段"等术语

### 13.4 通道 B 验收

- [ ] 疏离期角色绝不发照片（即使 LLM 输出了 SEND_PHOTO 标记）
- [ ] 热恋期角色照片发送概率明显高于平稳期
- [ ] 概率门未通过时用户无任何感知

### 13.5 UI 约束验收

- [ ] 设置页"我的角色"不展示好感度或阶段
- [ ] 任何页面都不展示数值化关系状态
- [ ] 任何 API 都不返回 affinity 字段给前端

---

## 十四、版本与维护

- **文档版本**: v1.2
- **对应 SKILL**: v1.2
- **对应 SPEC**: v1.2

### 维护规则

- 5 档阶段的边界值（0/20/40/60/80）一旦确定不轻易调整
- 各阶段的照片概率（0%/20%/70%/90%/100%）可根据用户反馈微调
- 各阶段的 Prompt 模板可以小幅迭代
- 6 位角色的情感参数（gainRate / lossRate / thawThreshold / jealousyFactor）以 `docs/characters.md` 为权威来源，本文档不重复定义
- 任何机制变更必须同步更新本文档、SKILL、SPEC、schema、seed
