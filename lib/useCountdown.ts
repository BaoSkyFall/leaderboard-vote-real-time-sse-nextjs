"use client";

import { useEffect, useState } from "react";

/**
 * Server-authoritative countdown. `endsAt` and `serverNow` come from the SSE
 * snapshot; we compute the clock drift between server and client once per
 * snapshot and tick locally so late joiners and early joiners both see the
 * correct remaining time without trusting the client clock for validity.
 */
export function useCountdown(
  endsAt: number | null,
  serverNow: number,
): number {
  // drift = serverNow - clientNowAtSnapshot. remaining = endsAt - (Date.now() + drift)
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (endsAt === null) {
      setRemaining(0);
      return;
    }
    const drift = serverNow - Date.now();
    const compute = () => {
      const r = Math.max(0, Math.round((endsAt - (Date.now() + drift)) / 1000));
      setRemaining(r);
    };
    compute();
    const t = setInterval(compute, 250);
    return () => clearInterval(t);
  }, [endsAt, serverNow]);

  return remaining;
}

export function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
