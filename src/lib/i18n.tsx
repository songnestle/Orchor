"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "zh";

/**
 * Translation dictionary. Keys are stable identifiers; values hold the
 * English + Chinese strings. Add keys here as you localize more of the UI.
 */
const dict = {
  // Nav
  "nav.discover": { en: "Discover", zh: "发现" },
  "nav.creator": { en: "Creator", zh: "创作者" },
  "nav.transactions": { en: "Transactions", zh: "交易记录" },
  "nav.explore": { en: "Explore", zh: "探索" },
  "nav.deck": { en: "Deck", zh: "卡组" },
  "nav.marketplace": { en: "Marketplace", zh: "市场" },
  "nav.rankings": { en: "Rankings", zh: "排行榜" },
  "nav.battle": { en: "Battle", zh: "对战" },
  "nav.create": { en: "Create", zh: "创建" },

  // Top bar
  "top.credits": { en: "Credits", zh: "积分" },
  "top.topup": { en: "Top Up", zh: "充值" },
  "top.connect": { en: "Connect Wallet", zh: "连接钱包" },
  "top.publish": { en: "Publish", zh: "发布" },

  // Hero
  "hero.title": { en: "The Skill Layer for AI Agents", zh: "AI 智能体的技能层" },
  "hero.subtitle": {
    en: "Collect, run and trade AI skill cards. Funded across multiple chains.",
    zh: "收藏、运行、交易 AI 技能卡，支持多链充值。",
  },
  "hero.explore": { en: "Explore Skills", zh: "浏览技能" },

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

  // Marketplace
  "market.title": { en: "Marketplace", zh: "市场" },
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

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load saved preference on mount.
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("orchor:lang")) as Lang | null;
    if (saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("orchor:lang", l);
      document.documentElement.lang = l;
    }
  }

  function t(key: TranslationKey): string {
    const entry = dict[key];
    return entry ? entry[lang] : key;
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
      t: (key: TranslationKey) => (dict[key] ? dict[key].en : key),
    };
  }
  return ctx;
}
