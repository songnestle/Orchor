# Orchor Premium UI Design Specification

## Overview
Transform Orchor from a standard marketplace into a premium Web3 social card game interface - inspired by Pokémon TCG, Hearthstone, and modern AI developer tools.

---

## Design Philosophy

**Core Principle**: Orchor is not a SaaS product. It's a playable marketplace for human expertise.

**Aesthetic**: Dark futuristic interface with collectible holographic card aesthetics
**Interaction**: Game-like HUD elements with social feed mechanics
**Feel**: Premium, minimal, but entertaining

---

## Color System

### Primary Palette
```css
--orchor-black: #0A0B0F
--orchor-void: #13141A
--orchor-violet: #7C3AED
--orchor-purple: #8B5CF6
--orchor-fuchsia: #C026D3
--orchor-silver: #E5E7EB
--orchor-platinum: #F3F4F6
--orchor-gold: #FBBF24
```

### Rarity Colors
```css
--rarity-common: #64748B      /* Slate */
--rarity-rare: #3B82F6         /* Blue */
--rarity-epic: #8B5CF6         /* Purple */
--rarity-legendary: #F59E0B    /* Amber */
--rarity-mythic: #EC4899       /* Pink + Glow */
```

### Semantic Colors
```css
--orchor-success: #10B981
--orchor-warning: #F59E0B
--orchor-danger: #EF4444
--orchor-info: #3B82F6
```

---

## Typography

### Font Stack
```css
--font-display: "Orbitron", "Inter", system-ui
--font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI"
--font-mono: "Fira Code", "JetBrains Mono", monospace
```

### Scale
```css
--text-xs: 0.75rem      /* 12px */
--text-sm: 0.875rem     /* 14px */
--text-base: 1rem       /* 16px */
--text-lg: 1.125rem     /* 18px */
--text-xl: 1.25rem      /* 20px */
--text-2xl: 1.5rem      /* 24px */
--text-3xl: 1.875rem    /* 30px */
--text-4xl: 2.25rem     /* 36px */
```

---

## Card System

### Card Dimensions
- **Standard**: 280px × 400px
- **Compact**: 220px × 320px
- **Large**: 350px × 500px
- **Hero**: 500px × 700px

### Card Anatomy
```
┌─────────────────────┐
│  [Rarity Badge]     │ ← Top-right corner
│                     │
│   [Artwork]         │ ← 40% of card height
│                     │
├─────────────────────┤
│  Skill Name         │
│  Category Badge     │
├─────────────────────┤
│  Creator Avatar     │
│  ⭐ Rating • Uses   │
├─────────────────────┤
│  [Attribute Bars]   │
│  Speed  ████░       │
│  Cost   ███░░       │
│  Power  █████       │
├─────────────────────┤
│ [Run] [Collect]     │ ← Action buttons
└─────────────────────┘
```

### Card Effects

**Holographic Shine**
```css
background: linear-gradient(
  135deg,
  rgba(124, 58, 237, 0.1) 0%,
  rgba(192, 38, 211, 0.1) 50%,
  rgba(124, 58, 237, 0.1) 100%
);
animation: holographic-shift 3s ease-in-out infinite;
```

**Hover Effect**
- Lift: `transform: translateY(-8px) scale(1.02)`
- Glow: `box-shadow: 0 20px 60px rgba(124, 58, 237, 0.4)`
- Shimmer animation
- Particle effects for Mythic cards

---

## Page Structure

### 1. Home / Skill Card Arena

**Layout**: Grid-based card gallery with filters
**Hero Section**: Animated featured card carousel
**Sections**:
- Featured Skills (horizontal scroll)
- Trending Now (3-column grid)
- New Arrivals
- Top Rated

**Filters**: Category, Rarity, Price, Creator

---

### 2. Explore Feed

**Layout**: Masonry/Pinterest-style infinite scroll
**Card Actions**: Quick run, collect, share
**Interactions**:
- Like/Rate
- Comment
- Remix
- Share

**Right Sidebar**:
- Trending hashtags
- Top creators
- Live activity feed

---

### 3. Skill Card Detail Page

**Layout**: Split view
- Left: Large animated card (60%)
- Right: Details & actions (40%)

**Information Blocks**:
```
┌─────────────────────────────────────┐
│  [Large Animated Card]              │
│  - Holographic effects              │
│  - Rarity glow                      │
│  - Click to flip for stats          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Skill Name                         │
│  By @creator • Category Badge       │
│  ⭐⭐⭐⭐⭐ 4.8 (1.2k ratings)        │
├─────────────────────────────────────┤
│  [Run Now] [Collect for 0.1 ETH]   │
├─────────────────────────────────────┤
│  Description                        │
│  "Expert VC research agent..."      │
├─────────────────────────────────────┤
│  Attributes                         │
│  Speed     █████░ 9/10              │
│  Accuracy  ████░░ 8/10              │
│  Cost      ███░░░ 6/10              │
├─────────────────────────────────────┤
│  Card Economics                     │
│  Supply: 100 / 1000                 │
│  Floor Price: 0.08 ETH              │
│  Runtime Fee: 0.001 ETH/run         │
│  Creator Royalty: 5%                │
├─────────────────────────────────────┤
│  Privacy Verification               │
│  ✓ Privacy Compiler Verified        │
│  ✓ Zero-knowledge execution         │
│  ✓ Context isolation                │
├─────────────────────────────────────┤
│  Trade History                      │
│  [Price chart]                      │
├─────────────────────────────────────┤
│  Similar Skills                     │
│  [Card] [Card] [Card]               │
└─────────────────────────────────────┘
```

---

### 4. Create Card Flow

**Step 1: Upload .or File**
```
┌─────────────────────────────────────┐
│   [Drag & Drop Zone]                │
│   📦 Drop your .or file here        │
│                                     │
│   or [Browse Files]                 │
│                                     │
│   .or files are privacy-preserving  │
│   executable expertise packages     │
└─────────────────────────────────────┘
```

**Step 2: Card Configuration**
- Skill name
- Description
- Category
- Artwork (upload or AI generate)
- Attribute scores

**Step 3: Economics**
- Supply (max mint count)
- First purchase price
- Runtime fee per execution
- Creator royalty %
- Trading permission (yes/no)
- Remix permission (yes/no/with-attribution)

**Step 4: Preview & Mint**
- Animated card preview
- Cost estimation
- Mint transaction

---

### 5. Deck Builder

**Layout**: Drag-and-drop interface
```
┌──────────────────────┬──────────────────┐
│  Available Cards     │  Your Deck       │
│  [Search & Filter]   │  (0 / 30)        │
│                      │                  │
│  [Card] [Card]       │  [Drop Zone]     │
│  [Card] [Card]       │                  │
│  [Card] [Card]       │  Deck Stats:     │
│  ...                 │  Avg Cost: 2.5   │
│                      │  Avg Speed: 7.2  │
│                      │  Power: 156      │
│                      │                  │
│                      │  [Save Deck]     │
└──────────────────────┴──────────────────┘
```

**Deck Types**:
- Research Deck
- Trading Deck
- Content Creation Deck
- Custom

---

### 6. Battle / Comparison Arena

**Layout**: VS screen
```
┌────────────────────────────────────────┐
│           SKILL BATTLE                 │
├──────────────────┬─────────────────────┤
│                  │                     │
│    [Card A]      │     [Card B]        │
│                  │                     │
│  Speed:   8/10   │   Speed:   7/10    │
│  Power:   9/10   │   Power:   10/10   │
│  Cost:    5/10   │   Cost:    6/10    │
│  Rating:  4.8    │   Rating:  4.9     │
│                  │                     │
│  [Run Battle]    │                     │
└──────────────────┴─────────────────────┘
```

**Battle Modes**:
- Side-by-side comparison
- Live execution race
- Community voting

---

### 7. Marketplace

**Layout**: Trading interface
```
┌─────────────────────────────────────┐
│  Filters                            │
│  Category: [All ▼]                  │
│  Rarity:   [All ▼]                  │
│  Price:    [0] - [10] ETH           │
│  Sort:     [Price: Low to High ▼]  │
├─────────────────────────────────────┤
│  [Card] [Card] [Card] [Card]        │
│  0.1Ξ   0.2Ξ   0.15Ξ  0.3Ξ         │
│                                     │
│  [Card] [Card] [Card] [Card]        │
│  ...                                │
└─────────────────────────────────────┘
```

**Trading Features**:
- Buy now
- Make offer
- Auction
- Trade history
- Price alerts

---

### 8. Rankings

**Layout**: Leaderboard
```
┌──────────────────────────────────────────┐
│  🏆 TOP SKILLS                           │
│  [This Week] [All Time] [By Category]   │
├──────────────────────────────────────────┤
│  #1  [Card Preview]  ⭐ 4.9  12.5k runs │
│  #2  [Card Preview]  ⭐ 4.8  10.2k runs │
│  #3  [Card Preview]  ⭐ 4.7  9.8k runs  │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Ranking Categories**:
- Most Used
- Highest Rated
- Most Traded
- Rising Stars
- Creator Spotlight

---

### 9. Creator Profile

**Layout**: Profile with card gallery
```
┌─────────────────────────────────────┐
│  [Avatar]  @creator_name            │
│            Verified Creator ✓       │
│                                     │
│  Total Skills: 24                   │
│  Total Runs: 125k                   │
│  Avg Rating: ⭐ 4.7                 │
│  Earnings: 45.2 ETH                 │
│                                     │
│  [Follow] [Message] [Share]         │
├─────────────────────────────────────┤
│  Created Skills                     │
│  [Card] [Card] [Card] [Card]        │
│  ...                                │
├─────────────────────────────────────┤
│  Collected Skills                   │
│  [Card] [Card] [Card]               │
└─────────────────────────────────────┘
```

---

## Components

### Core Components

1. **SkillCard** - Main card component with rarity effects
2. **CardGallery** - Grid/masonry layout
3. **CardDetail** - Expanded view modal
4. **RarityBadge** - Animated rarity indicator
5. **AttributeBar** - Skill stat visualization
6. **CreatorBadge** - Verified creator indicator
7. **PrivacyBadge** - Privacy Compiler verification
8. **ActionButtons** - Run, Collect, Trade, Rate
9. **HolographicEffect** - Shimmer animation layer
10. **ParticleSystem** - Mythic card effects

### Utility Components

11. **FilterBar** - Search and filter controls
12. **SortDropdown** - Sorting options
13. **PriceTag** - ETH price display
14. **StatBar** - Progress bar for attributes
15. **TrendingBadge** - "🔥 Trending" indicator
16. **NewBadge** - "✨ New" indicator
17. **LiveIndicator** - Real-time activity pulse
18. **ToastNotification** - Game-style notifications
19. **LoadingSpinner** - Premium loading animation
20. **EmptyState** - Illustrated empty states

---

## Animations

### Card Animations
```css
/* Hover lift */
@keyframes card-hover {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-8px) scale(1.02); }
}

/* Holographic shimmer */
@keyframes holographic-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Rarity glow pulse */
@keyframes rarity-glow {
  0%, 100% { box-shadow: 0 0 20px var(--rarity-color); }
  50% { box-shadow: 0 0 40px var(--rarity-color); }
}

/* Card flip */
@keyframes card-flip {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(180deg); }
}

/* Particle float (Mythic) */
@keyframes particle-float {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
}
```

### UI Animations
```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale in */
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## Interaction Patterns

### Card Hover
1. Lift animation (200ms ease-out)
2. Rarity glow intensifies
3. Show quick actions overlay
4. Subtle particle effect (Mythic only)

### Card Click
1. Scale down slightly (50ms)
2. Open detail modal
3. Blur background
4. Animate modal entrance

### Run Button
1. Button glow effect
2. "Running..." state with spinner
3. Success animation
4. Toast notification with result

### Collect Button
1. Wallet connection check
2. Price confirmation modal
3. Transaction pending state
4. Success: card flies to profile (animation)
5. Confetti effect

---

## Responsive Behavior

### Breakpoints
```css
--mobile: 640px
--tablet: 768px
--desktop: 1024px
--wide: 1280px
--ultra: 1536px
```

### Card Grid
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Wide: 4 columns
- Ultra: 5 columns

---

## Performance Considerations

### Optimization Strategies
1. Lazy load card images
2. Virtual scrolling for large galleries
3. Debounce search/filter
4. CSS transforms for animations (GPU)
5. Intersection Observer for scroll effects
6. Memoize card components
7. Code split by route
8. Optimize holographic effects (use will-change sparingly)

---

## Accessibility

### Requirements
- Keyboard navigation for all cards
- Focus indicators with high contrast
- ARIA labels for icons and actions
- Screen reader descriptions for cards
- Reduced motion support
- Color blind friendly rarity system (use patterns + colors)

---

## Implementation Priority

### Phase 1: Core (Week 1-2)
- [ ] Color system & CSS variables
- [ ] SkillCard component
- [ ] CardGallery layout
- [ ] Rarity system
- [ ] Basic animations

### Phase 2: Pages (Week 3-4)
- [ ] Home / Arena
- [ ] Explore feed
- [ ] Card detail page
- [ ] Marketplace

### Phase 3: Advanced (Week 5-6)
- [ ] Create card flow
- [ ] Deck builder
- [ ] Battle arena
- [ ] Creator profile

### Phase 4: Polish (Week 7-8)
- [ ] Advanced animations
- [ ] Particle effects
- [ ] Sound effects
- [ ] Performance optimization

---

## Technical Stack

### Current Stack (Keep)
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Wagmi + RainbowKit
- Prisma

### Additions Needed
```bash
npm install @react-three/fiber @react-three/drei  # 3D effects
npm install react-spring                          # Advanced animations
npm install react-virtualized                     # Performance
npm install react-intersection-observer           # Lazy loading
```

---

## File Structure

```
src/
├── components/
│   ├── cards/
│   │   ├── SkillCard.tsx
│   │   ├── CardGallery.tsx
│   │   ├── CardDetail.tsx
│   │   ├── RarityBadge.tsx
│   │   └── HolographicEffect.tsx
│   ├── ui/
│   │   ├── AttributeBar.tsx
│   │   ├── StatBar.tsx
│   │   ├── Badge.tsx
│   │   └── Button.tsx
│   └── effects/
│       ├── ParticleSystem.tsx
│       └── ShimmerLayer.tsx
├── app/
│   ├── arena/           # Home
│   ├── explore/         # Feed
│   ├── skill/[id]/      # Detail
│   ├── create/          # Create flow
│   ├── deck/            # Deck builder
│   ├── battle/          # Comparison
│   ├── market/          # Marketplace
│   ├── rankings/        # Leaderboards
│   └── creator/[id]/    # Profile
└── styles/
    ├── premium.css      # New premium styles
    └── animations.css   # Animation library
```

---

## Next Steps

1. Review & approve this spec
2. Create design mockups (Figma/CodePen)
3. Implement Phase 1 components
4. User testing
5. Iterate & refine

---

*This specification transforms Orchor from a standard marketplace into a premium, playable Web3 social card game.*
