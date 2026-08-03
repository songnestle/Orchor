"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { useOrchorWrites } from "@/lib/useOrchor";
import type { SkillModule } from "@/lib/skills";

/**
 * 转让技能卡。ERC-1155 改造带来的新能力,旧版没有。
 *
 * 刻意在确认前把后果说清楚:转出后调用权立刻失效。
 * 权限由 balanceOf 派生,没有「卖了卡还留着钥匙」这回事。
 */
interface Props {
  skill: SkillModule | null;
  max: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferCardModal({ skill, max, isOpen, onClose }: Props) {
  const { transfer, isPending, isConfirming, isConfirmed } = useOrchorWrites();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTo("");
      setAmount(1);
      setError(null);
    }
  }, [isOpen, skill?.id]);

  useEffect(() => {
    if (isConfirmed) onClose();
  }, [isConfirmed, onClose]);

  if (!isOpen || !skill) return null;

  const valid = isAddress(to) && amount >= 1 && amount <= max;
  const busy = isPending || isConfirming;

  async function submit() {
    setError(null);
    try {
      await transfer(to as `0x${string}`, skill!.id, amount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "转让失败");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(6,5,3,.82)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] p-7 rounded-[3px]"
        style={{ background: "var(--o-surface)", border: "0.5px solid var(--o-line-3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="m-0 text-[11px] tracking-[2.5px]" style={{ color: "var(--o-ink-4)" }}>
          转让凭证
        </p>
        <h2
          className="mt-2 mb-0 text-[21px] leading-tight"
          style={{ fontFamily: "var(--o-serif)", color: "var(--o-ink)" }}
        >
          {skill.title}
        </h2>
        <p className="mt-1.5 mb-6 text-[12px]" style={{ color: "var(--o-ink-3)" }}>
          持有 {max} 份
        </p>

        <label className="block text-[11px] tracking-[1.5px] mb-2" style={{ color: "var(--o-ink-4)" }}>
          接收地址
        </label>
        <input
          className="input font-mono"
          placeholder="0x…"
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          spellCheck={false}
        />
        {to && !isAddress(to) ? (
          <p className="mt-2 mb-0 text-[12px]" style={{ color: "var(--o-down)" }}>
            不是有效的 EVM 地址
          </p>
        ) : null}

        {max > 1 ? (
          <>
            <label
              className="block text-[11px] tracking-[1.5px] mt-5 mb-2"
              style={{ color: "var(--o-ink-4)" }}
            >
              份数
            </label>
            <input
              className="input num"
              type="number"
              min={1}
              max={max}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
            />
          </>
        ) : null}

        <p
          className="mt-6 mb-6 p-3 text-[12px] leading-[1.7] rounded-[2px]"
          style={{ background: "rgba(168,112,95,.08)", color: "var(--o-ink-2)" }}
        >
          转出后,这张卡的调用权立刻转移给对方。权限由链上余额决定,
          {max === amount ? "全部转出后你将无法再调用该技能。" : "剩余份数仍可继续调用。"}
        </p>

        {error ? (
          <p className="mb-4 text-[12px]" style={{ color: "var(--o-down)" }}>
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button className="btn-neon flex-1 py-2.5" disabled={!valid || busy} onClick={submit}>
            {busy ? "确 认 中" : "转 让"}
          </button>
          <button className="btn-ghost px-6" onClick={onClose} disabled={busy}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
