import { redirect } from "next/navigation";

/** 探索即首页 —— 见 marketplace/page.tsx 的说明。 */
export default function ExploreRedirect() {
  redirect("/");
}
