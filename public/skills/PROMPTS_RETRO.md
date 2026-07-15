# Orchor 技能卡图片提示词 · 复古像素版 (RETRO PIXEL)

> 全部重新生成，覆盖旧的赛博朋克图。风格必须统一：复古 12-bit 像素艺术。

## 通用规格
- **尺寸**: 512 × 512 px（正方形，会裁进卡片图框）或 1024×585（7:4）
- **格式**: PNG
- **命名**: skill-0.png ~ skill-11.png，放进 public/skills/ 覆盖旧图

## 🎨 通用风格后缀（每条都必须加，保证 12 张统一）
```
16-bit pixel art, retro SNES JRPG style, warm muted earthy color palette (aged gold, mossy green, dusty red, deep charcoal, cream), limited color count, chunky pixels, dithering shading, no text, no letters, centered icon composition, dark warm background, cozy game aesthetic like Stardew Valley and Octopath Traveler
```

> 关键词解释：SNES/超任 JRPG 风、暖色做旧调、有限色、粗像素、抖动上色、居中图标构图。**不要**霓虹、不要赛博朋克、不要写实。

---

## 12 条提示词（英文提示词 + 中文场景）

### skill-0 · VC Research Agent（VC 研究）
`a pixel art magnifying glass over glowing scrolls and data charts, ancient research desk, treasure map vibe`

### skill-1 · Solidity Security Scanner（合约安全）
`a pixel art glowing shield with a lock, guarding a treasure chest of code runes, protective ward`

### skill-2 · Market Map Generator（市场地图）
`a pixel art old parchment world map with glowing territory markers and connected nodes, cartography`

### skill-3 · Competitor Scanner（竞品扫描）
`a pixel art spyglass telescope on a watchtower scanning distant flags, lookout scout`

### skill-4 · PM Strategy Pack（产品策略）
`a pixel art quest board with pinned scrolls and a branching path map, adventurer planning table`

### skill-5 · User Interview Summarizer（用户访谈）
`a pixel art cozy tavern conversation with glowing speech bubbles, gathering intel around a table`

### skill-6 · GTM Launch Planner（营销发布）
`a pixel art rocket or signal flare launching with radiating banners, festival announcement`

### skill-7 · Contract Risk Explainer（合约风险）
`a pixel art magnifying lens revealing hidden runes on a scroll, decoding ancient contract`

### skill-8 · Testnet Deploy Assistant（部署助手）
`a pixel art wizard tower with connected machinery and glowing pipes, building workshop`

### skill-9 · Onchain Data Pulse（链上数据）
`a pixel art glowing crystal heart pulsing with energy streams, magical data core`

### skill-10 · Agent Workflow Runner（多智能体）
`a pixel art group of small glowing robot familiars working together in a chain, party of helpers`

### skill-11 · Crypto Meme Stylist（Meme 风格）
`a pixel art playful jester with floating emoji orbs and confetti, cheerful trickster`

---

## 使用建议
- 每条 + 通用后缀一起用
- 即梦 / DALL-E / Midjourney 都行，Midjourney 加 `--ar 1:1 --style raw`
- **12 张一定要用同一套后缀**，否则风格会散
- 生成后覆盖 public/skills/skill-N.png，告诉我，我改代码 + 部署
