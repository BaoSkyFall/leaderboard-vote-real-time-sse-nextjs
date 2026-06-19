import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { resetElection } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (session.role !== "btc")
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });

  const election = await resetElection();
  return NextResponse.json({ ok: true, election });
}
