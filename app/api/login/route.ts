import { NextResponse } from "next/server";
import { findRosterUser } from "@/config/roster";
import { createToken, SESSION_COOKIE, cookieOptions } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let id = "";
  try {
    const body = await req.json();
    id = typeof body?.id === "string" ? body.id : "";
  } catch {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
  }

  const user = findRosterUser(id);
  if (!user) {
    return NextResponse.json({ error: "ID không hợp lệ" }, { status: 401 });
  }

  const token = createToken({ userId: user.id, role: user.role });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return res;
}
