"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAllSkills } from "@/lib/useAllSkills";
import { useI18n } from "@/lib/i18n";
import { PremiumSkillCard } from "@/components/premium/PremiumSkillCard";

type ListingType = "all" | "buy" | "auction";

export default function MarketplacePage() {
  const allSkills = useAllSkills();
  const { t } = useI18n();
  const [listingType, setListingType] = useState<ListingType>("all");

  const listings = allSkills.map(skill => ({
    ...skill,
    seller: `@${skill.creatorHandle}`,
    listingPrice: skill.priceMON * (0.8 + Math.random() * 0.4), // ±20% variation
    listingType: Math.random() > 0.7 ? "auction" : "buy",
    endTime: Date.now() + Math.random() * 86400000, // Random time in next 24h
  }));

  const filtered = listingType === "all"
    ? listings
    : listings.filter(l => l.listingType === listingType);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-bg/80 border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            🛒 {t("market.title")}
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
                  ? "bg-violet-600 text-white"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <PremiumSkillCard skill={listing} onClick={() => {}} />

              {/* Listing Badge */}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full glass-strong text-xs font-bold">
                {listing.listingType === "auction" ? `⏰ ${t("market.auction")}` : `🛍️ ${t("market.buyNow")}`}
              </div>

              {/* Price Footer */}
              <div className="mt-3 glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{t("market.seller")}</span>
                  <span className="text-xs text-violet-400 font-semibold">{listing.seller}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {listing.listingPrice.toFixed(3)} ETH
                  </span>
                  {listing.listingType === "auction" && (
                    <span className="text-xs text-gray-400">
                      Ends in {Math.floor((listing.endTime - Date.now()) / 3600000)}h
                    </span>
                  )}
                </div>
                <button className="w-full mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold hover:shadow-lg transition-all">
                  {listing.listingType === "auction" ? t("market.placeBid") : t("market.buyNow")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
