# Orchor — 任务快照

> 2026-08-04,黑金改版 + ERC-1155 上线后重写。
> 原 TODO 停留在 HTX/TRON 时代且宣称"核心功能 100%",与 CLAUDE.md
> 第四条「禁止虚报完成」冲突,已整体作废。本文件只记录可验证的事实。

## 已上线(链上/线上可验证)

- **OrchorCore1155** @ [`0x115B28c2AeafbbDef1853FE5ae135850F9D33D35`](https://testnet.blockscout.injective.network/address/0x115B28c2AeafbbDef1853FE5ae135850F9D33D35#code)
  — Injective Testnet (chainId 1439),源码已在 Blockscout 验证,部署区块 `135633301`
- 20 张技能卡按 `src/lib/skills.ts` 目录顺序注册,链上 id 与前端目录一一对应
- 卡即权限:`hasAccess = balanceOf > 0`,转让后原持有人权限立刻消失
  (16 个单元测试 + 主网前链上实测均通过)
- 全链上 SVG 卡面:`uri()` 返回纯 data URI,无 IPFS/服务器依赖
- 钱包签名会话:所有花钱 API 需先签名登录(无 AUTH_SECRET 服务直接报错,不静默降级)
- 事件索引器:`/api/skills/stats` 从 `ORCHOR_DEPLOY_BLOCK` 起扫链,
  卡面显示真实调用数/创作者收入
- 分账 70/25/5 为合约常量;创作者收款走 pull 模式(恶意合约地址无法 DoS 卡片)
- 二级版税 ERC-2981,默认 7%,硬上限 10%

## 未完成(诚实清单)

- [ ] `battle` 与 `profile` 页未接 `SkillGrid`,链上数据显示为破折号
- [ ] `.or` 封装的信封加密仍是 NEXT:提示词只存服务端是真的,
      端到端加密 + 链上门控解封未做
- [ ] 旧合约 `0xc5DBA0…4078` 上的解锁记录未迁移(测试网阶段放弃);
      如需保留,加 owner-only `airdropLegacy(address[], uint256[])`
- [ ] README §7-§8(battle-market / task-orderbook)仍是蓝图
- [ ] credits 相关 API 依赖 `DATABASE_URL`,与链上功能独立,缺库时会 500

## 运维备忘

- 服务器:`46.250.252.192:/var/www/orchor`,pm2 进程名 `orchor`,
  部署脚本 `deploy-server.sh`(幂等,构建失败不影响旧站)
- **服务器同时存在 `.env` 与 `.env.local`,Next.js 后者优先——改配置必须两个都改**
- Injective 测试网 RPC 不按 eth tx hash 索引收据:等收据会假死,
  用状态轮询确认(见 `scripts/seed-resume.ts` / `scripts/selfcheck.ts`)
