import { buildSnapshot } from "@/lib/snapshot";
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
  const encoder = new TextEncoder();

  let closed = false;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const teardown = () => {
    if (closed) return;
    closed = true;
    if (pollTimer) clearInterval(pollTimer);
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let lastFingerprint = "";

      // Stop polling when the client goes away (best-effort on serverless).
      // NOTE: presence is NOT tracked here — it is client-driven via
      // /api/presence — precisely because this signal is unreliable on Vercel.
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

      // Snapshot-on-connect: late joiners compute correct remaining time, and
      // reconnects self-heal to the authoritative server state.
      await emitSnapshot(true);

      pollTimer = setInterval(() => {
        void emitSnapshot(false);
      }, POLL_MS);

      heartbeatTimer = setInterval(() => {
        comment("heartbeat");
      }, HEARTBEAT_MS);
    },
    cancel() {
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
