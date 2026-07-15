"use client";

import { useI18n } from "@/lib/i18n";

/**
 * Compact EN / 中 toggle. Persists choice to localStorage via the i18n provider.
 */
export function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden text-[11px] font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 transition ${
          lang === "en" ? "bg-[#b07f2f] text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("zh")}
        className={`px-2.5 py-1.5 transition ${
          lang === "zh" ? "bg-[#b07f2f] text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        中
      </button>
    </div>
  );
}
