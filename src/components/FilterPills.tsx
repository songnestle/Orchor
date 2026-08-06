"use client";

/**
 * 胶囊筛选条。
 *
 * 原来的筛选是"下划线 tab",选中态靠一条金线 —— 分类一多就成了一排金线,
 * 既吃掉金色预算又不好点。胶囊是现代做法(pools.trade / Apple 都用它):
 * 选中态用填充块,未选中只有文字,金色一处不占。
 */
interface Option {
  key: string;
  label: string;
}

export function FilterPills({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="text-[12px] px-3.5 py-1.5 transition-colors duration-150 whitespace-nowrap"
            style={{
              borderRadius: "var(--o-r-pill)",
              background: on ? "var(--o-ink)" : "transparent",
              color: on ? "#141209" : "var(--o-ink-3)",
              border: `1px solid ${on ? "transparent" : "var(--o-hair)"}`,
            }}
            onMouseEnter={(e) => {
              if (!on) e.currentTarget.style.color = "var(--o-ink-2)";
            }}
            onMouseLeave={(e) => {
              if (!on) e.currentTarget.style.color = "var(--o-ink-3)";
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
