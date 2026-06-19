import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { startElection } from "@/lib/store";
import {
  DEFAULT_DURATION_SEC,
  MIN_DURATION_SEC,
  MAX_DURATION_SEC,
} from "@/config/event";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (session.role !== "btc")
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });

  let durationSec = DEFAULT_DURATION_SEC;
  try {
    const body = await req.json();
    if (typeof body?.durationSec === "number" && Number.isFinite(body.durationSec)) {
      durationSec = Math.round(body.durationSec);
    }
  } catch {
    /* use default */
  }
  durationSec = Math.min(MAX_DURATION_SEC, Math.max(MIN_DURATION_SEC, durationSec));

  const election = await startElection(durationSec);
  return NextResponse.json({ ok: true, election });
}
