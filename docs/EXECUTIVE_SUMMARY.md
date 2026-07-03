# Orchor 多链架构升级 - 执行摘要

## 📍 文档位置

所有规划文档已保存在: `/Users/nestle/Orchor/.claude/`

- **plan.md** (778 行, 25KB) - 完整实施计划
- **architecture.md** (790 行, 28KB) - 技术架构详解
- **evaluation.md** (370 行, 11KB) - 可行性评估

---

## 🎯 核心改造内容

### 当前问题
你的 Orchor 项目现在是 **Monad 单链 + 每次调用需链上交易** 的模式：
- 用户每次运行技能都要签名 + 等待 2-5 秒确认
- 只支持 Monad 一条链
- 没有真实的 AI Runtime（只有 mock）
- 创作者收益只能在 Monad 上提现

### 升级目标
将 Orchor 升级为 **多链 AI Skill Runtime Economy 平台**：

```
【旧模式】
用户钱包 → 每次调用签名 → Monad 链上交易 → 等待确认 → 执行技能

【新模式】
用户充值稳定币（TRON/EVM 多链）→ 获得 Orchor Credits 
→ 即时执行技能（链下）→ B.ai Runtime 运行 → 创作者收益记录
→ 创作者提现（选择 TRON/EVM）
```

---

## 🏗️ 技术架构改造

### 1. **多链支付网关**
新增 3 个支付通道：
- **TRON Adapter** - TRC20-USDT，低手续费（~$1-3），适合 HTX 生态
- **EVM Adapter** - Monad/Base/Ethereum 的 USDC/USDT
- **X402 Adapter** - 未来的 HTTP 原生支付网关

**实现方式:**
```typescript
// 抽象接口
interface ChainAdapter {
  createDepositAddress(userId: string): Promise<DepositAddress>;
  verifyTransaction(txHash: string): Promise<TransactionStatus>;
  withdraw(params: WithdrawParams): Promise<WithdrawResult>;
  estimateFee(asset: string, amount: bigint): Promise<FeeEstimate>;
}

// 具体实现
class TronAdapter extends ChainAdapter { ... }
class EVMAdapter extends ChainAdapter { ... }
class X402Adapter extends ChainAdapter { ... }
```

### 2. **内部 Credit Ledger（账本系统）**
用 PostgreSQL 建立内部信用系统：

**数据库表:**
- `users` - 用户余额
- `ledger_entries` - 所有资金流动记录（双重记账）
- `deposits` - 充值记录
- `skill_runs` - 技能执行记录
- `creator_revenues` - 创作者收益
- `withdrawals` - 提现记录

**核心逻辑:**
```typescript
// 原子操作 - 扣除 Credits
async debitUser(userId, amount) {
  // 1. 锁定用户行
  const user = await db.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [userId]);
  
  // 2. 检查余额
  if (user.credits < amount) throw new Error('Insufficient credits');
  
  // 3. 扣除 + 记录
  await db.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [amount, userId]);
  await db.query('INSERT INTO ledger_entries ...'); // 记账
}
```

### 3. **Skill Runtime 执行引擎**
整合 B.ai 作为 AI 执行层：

```typescript
async function executeSkill(userId, skillId, input) {
  // 1. 检查余额 + 扣除 Credits（链下，即时）
  await ledgerService.debitUser({ userId, amount: skill.creditsPerRun });
  
  // 2. 调用 B.ai Runtime 执行
  const result = await baiClient.executeSkill({ skillId, input });
  
  // 3. 分配收益（链下记账）
  await revenueManager.distribute({
    creator: 70%,
    platform: 20%,
    reserve: 10%
  });
  
  return result;
}
```

### 4. **创作者收益仪表盘**
新增创作者后台：
- 实时查看每次调用的收益
- 总收益 / 可提现余额
- 选择提现链（TRON 快速低费 / EVM 通用）
- 交易历史

### 5. **用户界面改造**

**新增组件:**
- `TopUpCreditsModal` - 充值弹窗（选择链 → 选择金额 → 生成地址）
- `CreditBalance` - Credit 余额显示
- `TransactionHistory` - 交易历史
- `CreatorDashboard` - 创作者仪表盘

**SkillDetailModal 改造:**
```
之前: 
- Unlock (支付 MON) / Subscribe (支付 MON) / Invoke (消耗 Energy)

改为:
- 只有 Invoke（消耗 Credits，即时执行）
- 显示: 50 credits ≈ $0.50 USD
```

---

## 📊 实施阶段

### Phase 1: Foundation (2-4 周)
- ✅ PostgreSQL 数据库搭建
- ✅ Credit Ledger 系统
- ✅ Mock 支付适配器
- ✅ UI 显示 Credits（不破坏现有 Monad 流程）

**产出:** Credit 系统可演示，Monad 链上流程仍可用

### Phase 2: Credit System (2-3 周)
- ✅ 技能执行改用 Credits
- ✅ Mock B.ai Runtime
- ✅ 充值流程 UI
- ✅ 交易历史页面

**产出:** 用户可用 Credits 运行技能（模拟充值）

### Phase 3: Creator Dashboard (1 周)
- ✅ 创作者收益统计
- ✅ 提现请求流程
- ✅ 多链结算选择

**产出:** 创作者有完整的收益可见性

### Phase 4: Real Chain Integration (2-3 周)
- ✅ TronWeb SDK 集成（TRON 真实充值/提现）
- ✅ viem EVM 集成（Monad/Base 真实充值/提现）
- ✅ Webhook 监听充值确认
- ✅ Gas 费估算

**产出:** 真实资金流转（测试网）

### Phase 5: B.ai Runtime (1-2 周)
- ✅ B.ai SDK 集成
- ✅ 真实 AI 执行
- ✅ 流式输出
- ✅ 成本跟踪

**产出:** 技能真实执行，非 mock

### Phase 6: X402 (1 周，可选)
- ✅ X402 HTTP 支付集成
- ✅ API Key 认证

**产出:** 支持 HTTP API 调用技能

### Phase 7: UI Polish (1-2 周)
- ✅ Minimal Premium 设计风格
- ✅ 深色石墨背景 + 紫/银点缀
- ✅ 专业交易卡美学（去除游戏化元素）
- ✅ 参考: Linear, Vercel, OpenAI, Stripe

---

## 💰 收益模式对比

### 旧模式（链上）
```
用户支付 0.08 MON 解锁技能
  ↓ 链上分账
创作者获得 0.056 MON (70%)
平台获得 0.020 MON (25%)
储备 0.004 MON (5%)
```

### 新模式（链下 Credits）
```
用户充值 10 USDT → 获得 1000 Credits
运行技能消耗 50 Credits ($0.50)
  ↓ 链下分账
创作者收益 +35 Credits (70%)
平台收益 +10 Credits (20%)
B.ai 成本 -5 Credits (10%)

创作者累计到 500 Credits 时提现
  ↓ 选择链
TRON 提现 → $5 USDT - $1.5 手续费 = 净得 $3.5
```

---

## 🎨 UI 设计风格改造

### 当前风格
- 炫彩霓虹灯效果
- 游戏化卡牌（Mythic 粒子特效）
- 明亮的渐变色

### 目标风格（Minimal Premium）
- **背景:** 深色石墨灰 (#0E0E20) + 微妙网格纹理
- **卡片:** 圆角玻璃面板 + 细边框 + 内阴影
- **配色:** 黑/白/灰 + 淡紫色点缀 (#8B5CF6)
- **字体:** 极简无衬线 (SF Pro / Inter)
- **动画:** 流畅微妙，不夸张
- **感觉:** 专业、可信、神秘、高端

**参考对象:**
- Linear (简洁、技术感)
- Vercel (深色、精致)
- OpenAI (可信、清晰)
- Stripe (专业、抛光)
- Nothing (极简、高端)

**移除元素:**
- ❌ 赛博朋克风格
- ❌ 卡通图形
- ❌ 区块链立方体
- ❌ 机器人头像
- ❌ 过度霓虹效果

---

## 📈 核心优势

### 用户体验提升
| 指标 | 旧模式 | 新模式 | 提升 |
|------|--------|--------|------|
| 执行速度 | 2-5秒 (等链上确认) | <0.5秒 (即时) | **10倍** |
| 签名次数 | 每次调用 | 充值一次 | **100倍减少** |
| 支持链 | 1 (Monad) | 3+ (TRON/EVM/X402) | **3倍** |
| Gas 成本 | 每次 ~$0.0001 | 充值一次 $1-3 | **显著降低** |

### 创作者体验提升
- ✅ **实时收益可见** - 每次调用立即显示收益
- ✅ **灵活提现** - 选择最优链（TRON 快速低费）
- ✅ **数据洞察** - 调用统计、用户画像
- ✅ **稳定收入** - 不受区块链波动影响

### 平台竞争力
- ✅ **可扩展性** - 不受链 TPS 限制，可处理百万级调用
- ✅ **用户粘性** - Credit 系统降低流失率
- ✅ **商业模式** - 更灵活的定价（订阅、套餐）
- ✅ **生态整合** - HTX (TRON) + 通用 EVM + 未来 X402

---

## ⚠️ 风险与缓解

### 🔴 高风险
**1. 数据库事务完整性**
- 风险: Credit 双花、余额异常
- 缓解: PostgreSQL Transaction + Row Lock + 双重记账

**2. 充值确认延迟**
- 风险: 用户等待时间过长
- 缓解: 多链选择 + 显示预估时间 + 小额零确认

**3. B.ai API 不可用**
- 风险: 无法提供真实 AI 执行
- 缓解: Phase 1-4 用 OpenAI Mock，抽象 Runtime Interface

### 🟡 中风险
**4. 用户混淆 Credits / Energy / MON**
- 缓解: Onboarding 教程 + 清晰标注 + 计算器

**5. 创作者不信任链下记账**
- 缓解: 透明仪表盘 + 即时提现 + 审计报告

---

## 💡 关键决策点（需要你回答）

在开始实施前，请确认：

### 1️⃣ **B.ai API 状态**
- [ ] 有 API Key 和文档？
- [ ] 如果暂时没有，是否接受用 OpenAI 替代（Phase 1-4）？

### 2️⃣ **实施方案选择**
- [ ] **方案 A**: 激进升级（8-10 周，完整功能）
- [ ] **方案 C**: MVP 先行（4-6 周，快速验证，mock 外部集成）

### 3️⃣ **数据库选择**
- [ ] Vercel Postgres（推荐，集成简单）
- [ ] Supabase（功能更强）
- [ ] 自建 PostgreSQL

### 4️⃣ **预算确认**
- [ ] 开发时间: 8-12 周可接受？
- [ ] 基础设施: $150-200/月可接受？
- [ ] TRON API: $30/月，EVM RPC: $50/月

### 5️⃣ **UI 设计风格**
- [ ] 确认采用 Minimal Premium 风格？
- [ ] 移除游戏化元素，转向专业交易卡美学？

---

## 📋 下一步行动

一旦你确认上述决策，我将立即开始：

**Week 1-2:**
1. 创建数据库 Schema（6 张表）
2. 实现 Credit Ledger Service
3. 开发 Mock 支付适配器（TRON/EVM/X402）
4. 添加 Credits 余额 API

**Week 3-4:**
5. 改造 SkillDetailModal（使用 Credits）
6. 创建 TopUpCreditsModal
7. 开发技能执行 API（/api/skills/execute）
8. 实现收益分配逻辑

**Week 5-6:**
9. 创建 CreatorDashboard 组件
10. 开发提现请求流程
11. 集成真实 TRON/EVM 适配器
12. Webhook 监听充值确认

---

## 📄 总结

我完成了：

1. ✅ **深度理解你的项目** - 读取了 37 个源文件，分析了合约、前端、状态管理
2. ✅ **设计完整架构** - 多链支付 + Credit Ledger + B.ai Runtime + 创作者仪表盘
3. ✅ **评估可行性** - 技术可行（高）、业务可行（高）、风险可控
4. ✅ **制定实施计划** - 7 个阶段，8-12 周完整实施，4-6 周 MVP
5. ✅ **编写 1938 行文档** - plan.md + architecture.md + evaluation.md

**最终建议:** ✅ **GO - 批准实施**

**你现在需要做的:**
1. 阅读三份文档（在 `.claude/` 目录下）
2. 回答 5 个关键决策点
3. 选择实施方案（推荐方案 A 或 C）
4. 告诉我开始实施 🚀

需要我详细解释任何部分吗？
