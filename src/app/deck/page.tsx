"use client";

import { useMemo, useState } from "react";
import { SkillGrid } from "@/components/SkillGrid";
import { CardDetailModal } from "@/components/premium/CardDetailModal";
import { TransferCardModal } from "@/components/TransferCardModal";
import { useAllSkills } from "@/lib/useAllSkills";
import { useBalances, useOnchainSkills, useSubscribedSet } from "@/lib/useOrchor";
import { formatEther } from "viem";
import { useI18n } from "@/lib/i18n";
import type { SkillModule } from "@/lib/skills";

/**
 * 我的卡组。
 *
 * 持有状态来自 ERC-1155 余额，不再是 owned mapping。
 * 新增转让入口 —— 这是 1155 改造对用户最直观的差异：卡第一次真正属于他们。
 */
export default function DeckPage() {
  const allSkills = useAllSkills();
  const { t } = useI18n();
  const { balances } = useBalances();
  const { subscribed } = useSubscribedSet();
  const { skills: onchain } = useOnchainSkills();
  const [selected, setSelected] = useState<SkillModule | null>(null);
  const [transferring, setTransferring] = useState<SkillModule | null>(null);

  const deck = useMemo(
    () => allSkills.filter((s) => (balances.get(s.id) ?? 0) > 0),
    [allSkills, balances]
  );
  const leased = useMemo(
    () => allSkills.filter((s) => subscribed.has(s.id) && !(balances.get(s.id) ?? 0)),
    [allSkills, subscribed, balances]
  );

  /** 按链上解锁价计的账面价值。读不到就不显示，不用静态价凑数。 */
  const bookValue = useMemo(() => {
    if (!onchain.size) return null;
    let wei = 0n;
    for (const s of deck) {
      const c = onchain.get(s.id);
      if (!c) return null;
      wei += c.unlockPriceWei * BigInt(balances.get(s.id) ?? 0);
    }
    return formatEther(wei);
  }, [deck, onchain, balances]);

  const totalCards = deck.reduce((n, s) => n + (balances.get(s.id) ?? 0), 0);

  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-10">
      <header className="pt-14 pb-7">
        <h1
          className="m-0 text-[30px] sm:text-[36px] leading-[1.2]"
          style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)", letterSpacing: ".5px" }}
        >
          {t("deck.myDeck")}
        </h1>
        <dl
          className="flex flex-wrap gap-x-10 gap-y-5 mt-7 pt-5"
          style={{ borderTop: "0.5px solid var(--o-line)" }}
        >
          <Stat label={t("deck.kinds")} value={String(deck.length)} />
          <Stat label={t("deck.totalCerts")} value={String(totalCards)} />
          <Stat label={t("deck.bookValue")} value={bookValue === null ? "—" : bookValue} unit="INJ" />
          <Stat label={t("deck.leased")} value={String(leased.length)} />
        </dl>
      </header>

      {deck.length === 0 && leased.length === 0 ? (
        <section className="py-24 text-center">
          <p className="m-0 text-[15px]" style={{ color: "var(--o-ink-2)" }}>
            {t("deck.emptyTitle")}
          </p>
          <p className="mt-2 mb-7 text-[13px]" style={{ color: "var(--o-ink-3)" }}>
            {t("deck.emptyHint2")}
          </p>
          <a href="/" className="btn-neon inline-block px-7 py-3 no-underline">
            {t("deck.toMarket")}
          </a>
        </section>
      ) : (
        <>
          <section className="py-8">
            <SkillGrid skills={deck} onSelect={setSelected} />
          </section>

          {deck.length > 0 && (
            <section className="pb-10">
              <p className="text-[12px] mb-3" style={{ color: "var(--o-ink-4)" }}>
                {t("deck.transferSection")}
              </p>
              <div className="flex flex-wrap gap-2">
                {deck.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTransferring(s)}
                    className="btn-ghost px-4 py-2"
                  >
                    {s.title} × {balances.get(s.id) ?? 0}
                  </button>
                ))}
              </div>
            </section>
          )}

          {leased.length > 0 && (
            <section className="pb-14">
              <div
                className="flex items-baseline justify-between pb-4 mb-6"
                style={{ borderBottom: "0.5px solid var(--o-line)" }}
              >
                <h2
                  className="m-0 text-[18px]"
                  style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}
                >
                  {t("deck.leased")}
                </h2>
                <span className="text-[12px]" style={{ color: "var(--o-ink-3)" }}>
                  {t("deck.leaseNote")}
                </span>
              </div>
              <SkillGrid skills={leased} onSelect={setSelected} />
            </section>
          )}
        </>
      )}

      <CardDetailModal skill={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
      <TransferCardModal
        skill={transferring}
        max={transferring ? balances.get(transferring.id) ?? 0 : 0}
        isOpen={!!transferring}
        onClose={() => setTransferring(null)}
      />
    </main>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <dt className="m-0 text-[11px] tracking-[1.5px]" style={{ color: "var(--o-ink-4)" }}>
        {label}
      </dt>
      <dd className="num m-0 mt-1.5 text-[20px]" style={{ color: "var(--o-ink)" }}>
        {value}
        {unit ? <span className="text-[12px] ml-1.5" style={{ color: "var(--o-ink-3)" }}>{unit}</span> : null}
      </dd>
    </div>
  );
}
