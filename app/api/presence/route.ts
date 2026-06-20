import { getSession } from "@/lib/session";
import { markOnline, removeOnline } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Client-driven presence heartbeat (serverless-safe).
//  - POST {}            -> mark this user online (called ~every 4s)
//  - POST {leave:true}  -> remove immediately (sendBeacon on tab close / logout)
export async function POST(request: Request) {
  const session = getSession();
  if (!session) {
    return new Response(null, { status: 204 });
  }

  let leave = false;
  try {
    const body = (await request.json()) as { leave?: boolean } | null;
    leave = Boolean(body?.leave);
  } catch {
    // sendBeacon may send an empty/text body — treat as a normal ping.
  }

  if (leave) {
    await removeOnline(session.userId);
  } else {
    await markOnline(session.userId);
  }
  return new Response(null, { status: 204 });
}
