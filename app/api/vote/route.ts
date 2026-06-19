import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getElection, castVote } from "@/lib/store";
import { getCandidate } from "@/config/candidates";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let candidateId = "";
  try {
    const body = await req.json();
    candidateId = typeof body?.candidateId === "string" ? body.candidateId : "";
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }

  if (!getCandidate(candidateId)) {
    return NextResponse.json({ error: "Thí sinh không hợp lệ" }, { status: 400 });
  }

  // Server is the clock authority: only accept while genuinely running.
  const election = await getElection();
  if (election.state !== "running") {
    return NextResponse.json({ error: "Cuộc bình chọn chưa mở" }, { status: 409 });
  }
  if (election.endsAt !== null && Date.now() >= election.endsAt) {
    return NextResponse.json({ error: "Đã hết giờ bình chọn" }, { status: 409 });
  }

  const result = await castVote(session.userId, candidateId);
  if (!result.ok) {
    if (result.reason === "already_voted") {
      return NextResponse.json({ error: "Bạn đã bình chọn rồi" }, { status: 409 });
    }
    return NextResponse.json({ error: "Thí sinh không hợp lệ" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
