import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return res;
}
