import { allLabels, type TranslationKey } from "./i18n";
import type { SkillModule } from "./skills";

/**
 * 技能卡搜索。
 *
 * 两条容易踩的坑,都真实发生过:
 *
 * 1. 分类必须按**用户看到的那个词**匹配,不是枚举原值。界面胶囊写着
 *    "研究" / "Growth",而 s.category 的值是 Research / Marketing ——
 *    拿原值去匹配,用户搜屏幕上那个词只会得到 0 结果。
 *    而且要匹配**所有语言**的写法:中文用户完全可能在英文界面里输入
 *    "研究",反之亦然。
 *
 * 2. 创作者有两个名字:显示名 "Atlas Labs" 与 handle "atlaslabs"。
 *    卡组抽屉里给用户看的是前者,只搜后者就搜不到。
 */
export function matchSkill(s: SkillModule, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;

  const fields: Array<string | undefined> = [
    s.title,
    s.shortDescription,
    s.creator,
    s.creatorHandle,
    s.collectionName,
    s.origin,
    s.rarity,
    s.category,
    s.zh?.title,
    s.zh?.shortDescription,
    ...allLabels(`cat.${s.category}` as TranslationKey),
    ...allLabels(`metal.${s.rarity}` as TranslationKey),
  ];

  return fields.some((f) => f && f.toLowerCase().includes(needle));
}
