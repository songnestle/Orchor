"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "zh";

/**
 * Translation dictionary. Keys are stable identifiers; values hold the
 * English + Chinese strings. Add keys here as you localize more of the UI.
 */
const dict = {
  // ── 黑金改版新增 ──────────────────────────────────────────
  // 稀有度 = 金属。英文用金属本名，中文同理，不再是 Epic/Legendary 这类游戏黑话。
  "metal.Common":    { en: "Bronze",     zh: "青铜" },
  "metal.Rare":      { en: "Silver",     zh: "白银" },
  "metal.Epic":      { en: "Gold",       zh: "黄金" },
  "metal.Legendary": { en: "Platinum",   zh: "铂金" },
  "metal.Mythic":    { en: "Black Gold", zh: "黑金" },

  // 卡面
  "cert.calls30d":     { en: "Calls, last 30d", zh: "近 30 日调用" },
  "cert.noRecord":     { en: "No record yet",   zh: "暂无记录" },
  "cert.firstPeriod":  { en: "First period",    zh: "首期数据" },
  "cert.onchainName":  { en: "On-chain name",   zh: "链上名称" },
  "cert.unlockPrice":  { en: "Unlock",          zh: "解锁" },
  "cert.totalCalls":   { en: "Total calls",     zh: "累计调用" },
  "cert.creatorEarned":{ en: "Creator earned",  zh: "创作者已赚" },
  "cert.unlock":       { en: "Unlock",          zh: "解锁" },
  "cert.owned":        { en: "Owned",           zh: "已持有" },
  "cert.ownedN":       { en: "Holding {n}",     zh: "持有 {n} 份" },
  "cert.verify":       { en: "Verify on chain", zh: "链上核验" },
  "cert.minted":       { en: "{a} / {b}",       zh: "{a} / {b}" },
  "cert.circulating":  { en: "{n} in circulation", zh: "{n} 份流通" },
  "cert.notMinted":    { en: "Not minted",      zh: "尚未铸造" },

  // 首页(介绍页)
  "hero.eyebrow": { en: "Season 01 · Live on Injective Testnet", zh: "Season 01 · Injective 测试网已上线" },
  // README 官方对译:EN "The Capital Market for Machine Intelligence" ↔ ZH "AI 能力的资本市场"
  "hero.title":   { en: "The Capital Market for Machine Intelligence.", zh: "AI 能力的资本市场。" },
  "hero.lede": {
    en: "Orchor turns AI capabilities into collectible, executable, tradable Skill Cards — registered, priced and settled on-chain on Injective. Holding the card is the permission; transfer it and the permission goes with it.",
    zh: "Orchor 把 AI 能力封装成可收藏、可执行、可交易的技能卡——在 Injective 上注册、定价、结算。持卡即调用权，卡转走，权限随卡走。",
  },
  "hero.ctaMarket": { en: "Enter the market", zh: "进入市场" },
  "hero.ctaVerify": { en: "Verify on chain",  zh: "链上核验" },
  "hero.how":       { en: "How it works",     zh: "怎么玩" },
  "hero.step1t": { en: "Unlock",  zh: "解锁" },
  "hero.step1d": {
    en: "Buy a card outright with INJ. It mints as an ERC-1155 to your wallet — the artwork itself lives on-chain.",
    zh: "用 INJ 买断技能卡，ERC-1155 铸到你的钱包，卡面本身就存在链上。",
  },
  "hero.step2t": { en: "Invoke",  zh: "调用" },
  "hero.step2d": {
    en: "Holding the card is the access check. Top up ⚡ Energy (1 INJ = 100⚡) and every invocation settles on-chain.",
    zh: "持卡即权限。充值 ⚡ Energy（1 INJ = 100⚡），每次调用都在链上结算。",
  },
  "hero.step3t": { en: "Trade",   zh: "交易" },
  "hero.step3d": {
    en: "Cards transfer like any NFT — access moves with them, and creators earn a 7% royalty on every resale.",
    zh: "卡像任何 NFT 一样转让，权限随卡迁移；每次转手创作者抽 7% 版税。",
  },
  "hero.featured": { en: "Featured cards", zh: "精选卡片" },
  "hero.viewAll":  { en: "View all {n} cards", zh: "查看全部 {n} 张" },

  // 智能推荐(全部由真实链上指标推导,理由即算法)
  "picks.label":     { en: "Smart picks",          zh: "智能推荐" },
  "picks.trending":  { en: "Most invoked, 30d",    zh: "近 30 日调用最多" },
  "picks.value":     { en: "Best value per INJ",   zh: "性价比之选" },
  "picks.deckMatch": { en: "Matches your deck",    zh: "与你的持仓同类" },
  "picks.topEarner": { en: "Top-earning creator",  zh: "创作者收入最高" },
  "picks.calls":     { en: "{n} calls",            zh: "{n} 次调用" },

  // 市场页
  "market.title":    { en: "Skill Card Market", zh: "技能卡市场" },
  "market.lede": {
    en: "Every card is an on-chain certificate. Holding it grants permanent access, and it can be transferred or listed.",
    zh: "每一张卡是一份链上凭证。持有即永久调用权，可转让，可挂单。",
  },
  "market.registered":  { en: "Registered on chain", zh: "链上注册" },
  "market.mintedTotal": { en: "Certificates minted", zh: "已铸凭证" },
  "market.network":     { en: "Settlement network",  zh: "结算网络" },
  "market.contract":    { en: "Contract",            zh: "合约" },
  "market.verified":    { en: "Verified",            zh: "已验证" },
  "market.countCards":  { en: "{n} cards",           zh: "{n} 张" },
  "market.emptyCategory": { en: "No cards in this category yet.", zh: "这个分类下还没有卡片。" },
  "home.tagline":    { en: "AI skills, registered and settled on-chain.", zh: "AI 能力,在链上注册与结算。" },
  "home.taglineSub": { en: "{n} cards live on Injective.", zh: "{n} 张卡运行在 Injective 上。" },
  "trending.label":  { en: "Trending", zh: "热门" },
  "sort.label":      { en: "Sort", zh: "排序" },
  "market.searchPlaceholder": { en: "Search skills, creators, categories", zh: "搜索技能、创作者、分类" },
  "market.noMatch": { en: "Nothing matches that search.", zh: "没有匹配的技能卡。" },
  "sort.calls":     { en: "Most invoked",     zh: "调用最多" },
  "sort.priceAsc":  { en: "Price: low to high", zh: "价格从低到高" },
  "sort.priceDesc": { en: "Price: high to low", zh: "价格从高到低" },
  "sort.newest":    { en: "Newest",           zh: "最新上架" },
  "market.empty":       { en: "No cards here yet.",  zh: "这里还没有卡片。" },

  // 分类筛选
  "cat.all":        { en: "All",        zh: "全部" },
  "cat.Web3 Dev":   { en: "Web3",       zh: "Web3" },
  "cat.Research":   { en: "Research",   zh: "研究" },
  "cat.Automation": { en: "Automation", zh: "自动化" },
  "cat.Product":    { en: "Product",    zh: "产品" },
  "cat.Marketing":  { en: "Growth",     zh: "增长" },
  "cat.Data":       { en: "Data",       zh: "数据" },

  // 卡组
  "deck.myDeck":       { en: "My Deck",         zh: "我的卡组" },
  "deck.kinds":        { en: "Card types",      zh: "持有卡种" },
  "deck.totalCerts":   { en: "Certificates",    zh: "凭证总数" },
  "deck.bookValue":    { en: "Book value",      zh: "账面价值" },
  "deck.leased":       { en: "Leased",          zh: "租约中" },
  "deck.emptyTitle":   { en: "Your deck is empty.", zh: "卡组还是空的。" },
  "deck.emptyHint2": {
    en: "Unlock a skill card and it lands in your wallet as an ERC-1155 certificate.",
    zh: "解锁一张技能卡，它会以 ERC-1155 凭证的形式进入你的钱包。",
  },
  "deck.toMarket":     { en: "Browse market",   zh: "去 市 场" },
  "deck.transferSection": { en: "Transfer certificates", zh: "转让凭证" },
  "deck.leaseNote":    { en: "Subscriptions are leases and cannot be transferred.", zh: "订阅是租约，不可转让" },

  // 转让
  "xfer.title":     { en: "Transfer certificate", zh: "转让凭证" },
  "xfer.holding":   { en: "You hold {n}",         zh: "持有 {n} 份" },
  "xfer.to":        { en: "Recipient address",    zh: "接收地址" },
  "xfer.badAddr":   { en: "Not a valid EVM address", zh: "不是有效的 EVM 地址" },
  "xfer.amount":    { en: "Amount",               zh: "份数" },
  "xfer.warnAll": {
    en: "Access transfers immediately. Permission follows the on-chain balance, so once all copies are gone you can no longer invoke this skill.",
    zh: "转出后，这张卡的调用权立刻转移给对方。权限由链上余额决定，全部转出后你将无法再调用该技能。",
  },
  "xfer.warnSome": {
    en: "Access transfers immediately. Permission follows the on-chain balance; your remaining copies still work.",
    zh: "转出后，这张卡的调用权立刻转移给对方。权限由链上余额决定，剩余份数仍可继续调用。",
  },
  "xfer.submit":    { en: "Transfer",   zh: "转 让" },
  "xfer.submitting":{ en: "Confirming", zh: "确 认 中" },
  "xfer.cancel":    { en: "Cancel",     zh: "取消" },
  "xfer.failed":    { en: "Transfer failed", zh: "转让失败" },

  // 错误码 —— 后端与 hook 只传代号，展示层翻译。
  "err.WALLET_REQUIRED": { en: "Connect a wallet first",  zh: "请先连接钱包" },
  "err.NONCE_FAILED":    { en: "Could not start sign-in", zh: "获取登录消息失败" },
  "err.SIGNIN_FAILED":   { en: "Sign-in failed",          zh: "登录失败" },
  "err.USER_REJECTED":   { en: "Signature cancelled",     zh: "已取消签名" },
  "err.NO_ACCESS":       { en: "You don't hold this card and have no active subscription", zh: "链上未持有该技能卡，也没有有效订阅" },
  "err.UNAUTHORIZED":    { en: "Please connect your wallet and sign in", zh: "请先连接钱包并登录" },

  "err.PRICE_UNAVAILABLE": { en: "Could not read the on-chain price, try again", zh: "读不到链上价格，请稍后重试" },
  "err.WRONG_NETWORK":     { en: "Switch to {chain} to continue", zh: "请切换到 {chain} 后继续" },
  "err.NAME_LENGTH":       { en: "Skill name must be 1–48 characters", zh: "技能名长度需在 1–48 字符之间" },
  "err.NAME_CHARS":        { en: 'Skill name cannot contain " \\ < > or control characters', zh: '技能名不能包含 " \\ < > 或控制字符' },
  "err.NOT_SIGNED_IN":     { en: "Not signed in", zh: "未登录" },
  "err.BAD_ADDRESS":       { en: "Invalid address", zh: "地址无效" },
  "err.BAD_SIGNATURE":     { en: "Signature check failed", zh: "签名校验失败" },
  "err.MISSING_FIELDS":    { en: "Missing required fields", zh: "缺少必填字段" },
  "err.EXECUTION_FAILED":  { en: "Execution failed", zh: "执行失败" },

  "err.INSUFFICIENT_CREDITS": { en: "Not enough credits — need {need}, you have {have}", zh: "余额不足 —— 需要 {need}，当前 {have}" },

  // 登录
  "auth.signIn":     { en: "Sign in",  zh: "签名登录" },
  "auth.signingIn":  { en: "Signing…", zh: "签名中…" },
  "auth.rejected":   { en: "Signature cancelled", zh: "已取消签名" },
  "auth.needWallet": { en: "Connect a wallet first", zh: "请先连接钱包" },

  // Nav
  "nav.discover": { en: "Discover", zh: "发现" },
  "nav.creator": { en: "Creator", zh: "创作者" },
  "nav.transactions": { en: "Transactions", zh: "交易记录" },
  "nav.explore": { en: "Explore", zh: "探索" },
  "nav.deck": { en: "Deck", zh: "卡组" },
  "nav.marketplace": { en: "Marketplace", zh: "市场" },
  "top.energy": { en: "Top up Energy", zh: "充值 Energy" },
  "nav.rankings": { en: "Rankings", zh: "排行榜" },
  "nav.battle": { en: "Battle", zh: "对战" },
  "nav.create": { en: "Create", zh: "创建" },

  // Top bar
  "top.credits": { en: "Credits", zh: "积分" },
  "top.topup": { en: "Top Up", zh: "充值" },
  "top.connect": { en: "Connect Wallet", zh: "连接钱包" },
  "top.publish": { en: "Publish", zh: "发布" },

  // Card / actions
  "card.run": { en: "Run", zh: "运行" },
  "card.collect": { en: "Collect", zh: "收藏" },
  "card.running": { en: "Running…", zh: "运行中…" },
  "card.collecting": { en: "Collecting…", zh: "收藏中…" },
  "card.details": { en: "Details", zh: "详情" },
  "card.stats": { en: "Stats", zh: "数据" },
  "card.history": { en: "History", zh: "历史" },
  "card.balance": { en: "Your Balance", zh: "你的余额" },
  "card.costPerRun": { en: "Cost per Run", zh: "每次运行费用" },
  "card.processing": { en: "Processing…", zh: "处理中…" },
  "card.success": { en: "Success!", zh: "成功！" },

  // Top-up modal
  "topup.title": { en: "Top Up Credits", zh: "充值积分" },
  "topup.selectChain": { en: "Select Chain", zh: "选择链" },
  "topup.amount": { en: "Amount", zh: "金额" },
  "topup.willReceive": { en: "You will receive", zh: "你将获得" },
  "topup.quickAmounts": { en: "Quick Amounts", zh: "快捷金额" },
  "topup.generateAddress": { en: "Generate Deposit Address", zh: "生成充值地址" },
  "topup.instantDemo": { en: "Instant Top-Up (Demo)", zh: "即时充值（演示）" },
  "topup.demoHint": {
    en: "Demo mode credits your account instantly without an on-chain transfer.",
    zh: "演示模式无需链上转账，立即到账。",
  },
  "topup.credited": { en: "Credited", zh: "已到账" },
  "topup.done": { en: "Done", zh: "完成" },
  "topup.creditsUnit": { en: "credits", zh: "积分" },

  // Creator dashboard
  "creator.title": { en: "Creator Dashboard", zh: "创作者面板" },
  "creator.subtitle": { en: "Track your skill performance and earnings", zh: "查看你的技能表现与收益" },
  "creator.totalSkills": { en: "Total Skills", zh: "技能总数" },
  "creator.totalRuns": { en: "Total Runs", zh: "运行次数" },
  "creator.grossRevenue": { en: "Gross Revenue", zh: "总收入" },
  "creator.withdrawable": { en: "Withdrawable", zh: "可提现" },
  "creator.connectWallet": { en: "Connect your wallet to view creator dashboard", zh: "连接钱包以查看创作者面板" },
  "creator.loading": { en: "Loading creator stats...", zh: "加载创作者数据中…" },
  "creator.noData": { en: "No creator data found", zh: "暂无创作者数据" },

  // Explore
  "explore.title": { en: "Explore Skills", zh: "探索技能" },
  "explore.trending": { en: "Trending", zh: "热门" },
  "explore.topCreators": { en: "Top Creators", zh: "顶级创作者" },
  "explore.posts": { en: "posts", zh: "条帖子" },
  "common.runs": { en: "runs", zh: "次运行" },

  // Marketplace（market.title 在顶部新增块中定义）
  "market.buyNow": { en: "Buy Now", zh: "立即购买" },
  "market.placeBid": { en: "Place Bid", zh: "出价" },
  "market.seller": { en: "Seller", zh: "卖家" },
  "market.auction": { en: "Auction", zh: "拍卖" },
  "market.allListings": { en: "All Listings", zh: "全部" },
  "market.buyTab": { en: "Buy Now", zh: "一口价" },
  "market.auctionTab": { en: "Auctions", zh: "拍卖" },

  // Rankings
  "rankings.title": { en: "Rankings", zh: "排行榜" },
  "rankings.rank": { en: "Rank", zh: "排名" },
  "rankings.skill": { en: "Skill", zh: "技能" },
  "rankings.price": { en: "Price", zh: "价格" },

  // Deck
  "deck.title": { en: "My Deck", zh: "我的卡组" },
  "deck.totalValue": { en: "Total Value", zh: "总价值" },
  "deck.empty": { en: "No cards yet", zh: "暂无卡牌" },
  "deck.emptyHint": { en: "Start collecting AI skill cards to build your deck", zh: "开始收集 AI 技能卡来组建你的卡组" },
  "deck.browse": { en: "Browse Skills", zh: "浏览技能" },
  "deck.collected": { en: "cards collected", zh: "张卡牌已收集" },

  // Battle
  "battle.title": { en: "Battle Arena", zh: "竞技场" },
  "battle.chooseFighter": { en: "Choose Your Fighter", zh: "选择你的战士" },
  "battle.start": { en: "Start Battle", zh: "开始战斗" },
  "battle.victory": { en: "Victory!", zh: "胜利！" },
  "battle.defeat": { en: "Defeat", zh: "失败" },
  "battle.new": { en: "New Battle", zh: "新战斗" },
  "battle.rematch": { en: "Rematch", zh: "再战" },
  "battle.opponent": { en: "Opponent", zh: "对手" },
  "battle.you": { en: "You", zh: "你" },

  // Create page
  "create.title": { en: "Create Skill Card", zh: "创建技能卡" },
  "create.upload": { en: "Upload .or Package", zh: "上传 .or 包" },
  "create.configure": { en: "Configure Card", zh: "配置卡牌" },
  "create.cardName": { en: "Card Name", zh: "卡牌名称" },
  "create.description": { en: "Description", zh: "描述" },
  "create.rarity": { en: "Rarity", zh: "稀有度" },
  "create.preview": { en: "Preview coming soon", zh: "预览即将推出" },
  "create.deploying": { en: "Deploying...", zh: "部署中…" },
  "create.minting": { en: "Your skill card is being minted onchain", zh: "你的技能卡正在链上铸造" },

  // Profile page
  "profile.followers": { en: "Followers", zh: "粉丝" },
  "profile.following": { en: "Following", zh: "关注" },
  "profile.totalEarnings": { en: "Total Earnings", zh: "总收益" },
  "profile.skillsCreated": { en: "Skills Created", zh: "已创建技能" },
  "profile.follow": { en: "Follow", zh: "关注" },
  "profile.message": { en: "Message", zh: "消息" },
  "profile.created": { en: "Created", zh: "已创建" },
  "profile.collected": { en: "Collected", zh: "已收藏" },
  "profile.stats": { en: "Stats", zh: "数据" },
  "profile.title": { en: "Creator Profile", zh: "创作者主页" },
  "profile.noCollected": { en: "No collected cards yet", zh: "暂无收藏卡片" },

  // Transaction history
  "tx.title": { en: "Transaction History", zh: "交易历史" },
  "tx.loading": { en: "Loading transactions...", zh: "加载交易记录中…" },
  "tx.deposit": { en: "Deposit", zh: "充值" },
  "tx.withdrawal": { en: "Withdrawal", zh: "提现" },
  "tx.skillRun": { en: "Skill Execution", zh: "技能执行" },
  "tx.amount": { en: "Amount", zh: "金额" },
  "tx.chain": { en: "Chain", zh: "链" },
  "tx.confirmed": { en: "Confirmed", zh: "已确认" },
  "tx.pending": { en: "Pending", zh: "待处理" },
  "tx.failed": { en: "Failed", zh: "失败" },
  "tx.completed": { en: "Completed", zh: "已完成" },

  // Creator dashboard (extended)
  "creator.avgRating": { en: "Avg Rating", zh: "平均评分" },
  "creator.totalRevenue": { en: "Total Revenue", zh: "总营收" },
  "creator.withdraw": { en: "Withdraw Earnings", zh: "提取收益" },
  "creator.balance": { en: "Balance", zh: "余额" },

  // Arena / Hero (extended)
  "arena.featured": { en: "Featured", zh: "精选" },
  "arena.newArrivals": { en: "New Arrivals", zh: "最新上架" },
  "arena.viewAll": { en: "View All", zh: "查看全部" },
  "arena.recentActivity": { en: "Recent Activity", zh: "最近活动" },
  "arena.skills": { en: "Skills", zh: "技能" },

  // Top-up (extended)
  "topup.willReceiveHint": { en: "You will receive", zh: "你将收到" },
  "topup.orchorCredits": { en: "Orchor Credits", zh: "Orchor 积分" },

  // Common labels
  "common.back": { en: "Back", zh: "返回" },
  "common.continue": { en: "Continue", zh: "继续" },
  "common.deploy": { en: "Deploy", zh: "部署" },
  "common.chooseFile": { en: "Choose File", zh: "选择文件" },
  "common.change": { en: "Change", zh: "更改" },
  "common.selected": { en: "Selected", zh: "已选择" },
  "common.withdraw": { en: "Withdraw", zh: "提现" },

  // Card detail extended
  "card.description": { en: "Description", zh: "技能说明" },
  "card.exampleInput": { en: "Example Input", zh: "输入示例" },
  "card.exampleOutput": { en: "Example Output", zh: "输出示例" },
  "card.privacyVerification": { en: "Privacy Verification", zh: "隐私验证" },
  "card.runtimeModel": { en: "Runtime Model", zh: "运行模型" },
  "card.avgRating": { en: "Average Rating", zh: "平均评分" },
  "card.confirmWallet": { en: "Confirm transaction in your wallet...", zh: "在钱包中确认交易…" },

  // Create extended
  "create.dropHint": { en: "Drop your skill package here or click to browse", zh: "拖放技能包到此处或点击浏览" },
  "create.subtitle": { en: "Upload your .or package to mint a new skill card", zh: "上传 .or 包来铸造新技能卡" },

  // Battle extended
  "battle.subtitle": { en: "Challenge skills in head-to-head battles", zh: "在对战中挑战技能" },

  // Creator dashboard extended
  "creator.revenueBreakdown": { en: "Revenue Breakdown", zh: "收益明细" },
  "creator.creatorShare": { en: "Creator Share (70%)", zh: "创作者分成 (70%)" },
  "creator.platformFee": { en: "Platform Fee (20%)", zh: "平台费用 (20%)" },
  "creator.runtimeCost": { en: "Runtime Cost (10%)", zh: "运行成本 (10%)" },
  "creator.withdrawableBalance": { en: "Withdrawable Balance", zh: "可提现余额" },
  "creator.revenueBySkill": { en: "Revenue by Skill", zh: "技能收益" },
  "creator.recentTransactions": { en: "Recent Transactions", zh: "最近交易" },

  // Transactions extended
  "tx.subtitle": { en: "All your credit transactions in one place", zh: "所有积分交易记录" },
  "tx.noTransactions": { en: "No transactions found", zh: "暂无交易记录" },

  // Marketplace extended
  "market.subtitle": { en: "Buy, sell, and trade skill cards", zh: "购买、出售和交易技能卡" },
} as const;

export type TranslationKey = keyof typeof dict;

/**
 * 取某个 key 的全部语言写法。搜索要用:中文用户可能在英文界面下输入
 * "研究",英文用户也可能在中文界面下输入 "growth" —— 只匹配当前语言
 * 的显示名,这两种情况都会得到 0 结果。
 */
export function allLabels(key: TranslationKey): string[] {
  const entry = dict[key];
  return entry ? [entry.en, entry.zh] : [];
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // 首帧必须与 SSR 一致(恒为 "en"),否则中文用户每次整页加载都触发
  // React hydration 报错并整树客户端重渲——比语言闪变严重得多。
  // 已存语言在挂载后的 effect 里切换;要彻底消除闪变需把语言放进
  // cookie 让 SSR 可读,留待后续。
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("orchor:lang");
    if (saved === "zh") {
      setLangState("zh");
      document.documentElement.lang = "zh";
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("orchor:lang", l);
      document.documentElement.lang = l;
    }
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const entry = dict[key];
    let out: string = entry ? entry[lang] : key;
    // 简单占位符插值：{n} / {a} / {b}。
    // 中英文语序不同，把变量放进句子里而不是拼接字符串，才能真正双语。
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.split(`{${k}}`).join(String(v));
      }
    }
    return out;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback so components don't crash if used outside the provider.
    return {
      lang: "en" as Lang,
      setLang: () => {},
      t: (key: TranslationKey, vars?: Record<string, string | number>) => {
        let out: string = dict[key] ? dict[key].en : (key as string);
        if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
        return out;
      },
    };
  }
  return ctx;
}
