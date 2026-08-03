"use client";

import { useState } from "react";
import { useAllSkills } from "@/lib/useAllSkills";
import { useI18n } from "@/lib/i18n";
import { SkillGrid } from "@/components/SkillGrid";

type ListingType = "all" | "buy" | "auction";

export default function MarketplacePage() {
  const allSkills = useAllSkills();
  const { t } = useI18n();
  const [listingType, setListingType] = useState<ListingType>("all");

  // 曾经这里用 Math.random() 现编挂单价与拍卖倒计时 —— 每次刷新价格都变，
  // 而且在 SSR/CSR 之间不一致，直接触发 hydration 报错。
  // 二级市场数据必须来自链上；索引接好之前，市场页只展示一级市场的真实价格。
  const listings = allSkills.map((skill) => ({
    ...skill,
    seller: skill.creatorHandle.replace(/^@+/, "@"),
    listingType: "buy" as const,
  }));

  const filtered = listingType === "all"
    ? listings
    : listings.filter(l => l.listingType === listingType);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="border-b border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            {t("market.title")}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {t("market.subtitle")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-3">
          {[
            { key: "all", label: t("market.allListings") },
            { key: "buy", label: `🛍️ ${t("market.buyTab")}` },
            { key: "auction", label: `⏰ ${t("market.auctionTab")}` },
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setListingType(type.key as ListingType)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                listingType === type.key
                  ? "bg-[#b07f2f] text-white"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <SkillGrid skills={filtered} />
      </div>
    </div>
  );
}
