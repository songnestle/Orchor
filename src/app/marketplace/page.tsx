import { redirect } from "next/navigation";

/**
 * 市场即首页。
 *
 * 改版前 /、/explore、/marketplace 三个入口铺的是同一批卡,只是布局略有
 * 差别 —— 用户在导航里选哪个都一样,等于三个页面在互相稀释。内容统一到
 * 首页,这两条旧路径保留为重定向,外部链接与书签不至于 404。
 */
export default function MarketplaceRedirect() {
  redirect("/");
}
