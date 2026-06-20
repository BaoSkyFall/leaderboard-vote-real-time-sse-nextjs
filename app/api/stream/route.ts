import { getSession } from "@/lib/session";
import { buildSnapshot } from "@/lib/snapshot";
import { addConnection, heartbeatConnection, removeConnection } from "@/lib/store";
import type { Snapshot } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const POLL_MS = 1000;
const HEARTBEAT_MS = 15_000;

// Fields that, when changed, warrant pushing a new snapshot to the client.
function fingerprint(s: Snapshot): string {
  const counts = s.ranking.map((r) => `${r.candidateId}:${r.count}:${r.rank}`).join(",");
  return `${s.state}|${s.endsAt}|${s.online}|${counts}`;
}

export async function GET(request: Request) {
  const session = getSession();
  const connId = crypto.randomUUID();
  // Presence is keyed by user; anonymous viewers (shouldn't reach here, /event
  // requires a session) fall back to a per-connection identity.
  const presenceUser = session?.userId ?? `guest:${connId}`;
  const encoder = new TextEncoder();

  let closed = false;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  // Single idempotent teardown. CRITICAL for Vercel serverless: the only
  // reliable client-disconnect signal there is request.signal "abort" — the
  // ReadableStream cancel() often does NOT fire, so without this the poll/
  // heartbeat interval keeps refreshing this connection's timestamp in Redis
  // forever and the online count never drops when someone leaves.
  const teardown = () => {
    if (closed) return;
    closed = true;
    if (pollTimer) clearInterval(pollTimer);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    void removeConnection(connId);
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastFingerprint = "";

      // Detect client disconnect ASAP (before any await), then stop everything
      // and drop the connection so the online count decreases immediately.
      request.signal.addEventListener("abort", () => {
        teardown();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          teardown();
        }
      };

      const comment = (text: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ${text}\n\n`));
        } catch {
          teardown();
        }
      };

      const emitSnapshot = async (force = false) => {
        if (closed) return;
        const snap = await buildSnapshot();
        const fp = fingerprint(snap);
        if (force || fp !== lastFingerprint) {
          lastFingerprint = fp;
          send("snapshot", snap);
        }
      };

      // If the client already vanished during setup, don't register presence.
      if (request.signal.aborted) {
        teardown();
        try {
          controller.close();
        } catch {
          /* noop */
        }
        return;
      }

      // Register this live connection before the first snapshot so the count
      // already reflects it.
      await addConnection(connId, presenceUser);

      // Snapshot-on-connect: late joiners compute correct remaining time, and
      // reconnects self-heal to the authoritative server state.
      await emitSnapshot(true);

      pollTimer = setInterval(() => {
        // Heartbeat keeps this connection "live" inside the presence TTL window.
        void heartbeatConnection(connId, presenceUser);
        void emitSnapshot(false);
      }, POLL_MS);

      heartbeatTimer = setInterval(() => {
        comment("heartbeat");
      }, HEARTBEAT_MS);
    },
    cancel() {
      // Fires on a clean local disconnect; on Vercel the abort listener above
      // is the dependable path. Both funnel through the same idempotent teardown.
      teardown();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
