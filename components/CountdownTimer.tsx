"use client";

import { useCountdown, formatMMSS } from "@/lib/useCountdown";
import type { Snapshot } from "@/lib/types";

interface CountdownTimerProps {
  readonly snapshot: Snapshot;
}

export default function CountdownTimer({ snapshot }: CountdownTimerProps) {
  const remaining = useCountdown(snapshot.endsAt, snapshot.serverNow);
  const urgent = remaining > 0 && remaining < 30;

  return (
    // Matches the sticky header pill in voting.html exactly
    <div className="sticky top-20 z-40 mb-lg flex justify-center">
      <div
        className="flex items-center gap-4 rounded-full border border-outline-variant/40 bg-surface-container-highest/90 px-6 py-3 shadow-xl backdrop-blur-md"
        style={{ boxShadow: urgent ? "0 0 25px rgba(255,138,53,0.4)" : "0 0 25px rgba(20,82,245,0.6)" }}
      >
        {/* Countdown time */}
        <div className="flex flex-col items-center">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
            Thời gian
          </span>
          <span
            className={`font-stat-lg-mobile text-stat-lg-mobile leading-none tracking-tighter tabular-nums ${
              urgent ? "animate-pulse-timer text-error-red" : "text-primary"
            }`}
          >
            {formatMMSS(remaining)}
          </span>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-outline-variant/30" />

        {/* LIVE label + BÌNH CHỌN */}
        <div className="flex flex-col items-start">
          <div className="mb-0.5 flex items-center gap-1.5">
            {/* Ripple dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-error-red opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error-red" />
            </span>
            <span className="font-label-caps text-label-caps font-bold text-error-red">
              LIVE
            </span>
          </div>
          <h1 className="font-title-md text-title-md leading-none text-on-surface">
            BÌNH CHỌN
          </h1>
        </div>
      </div>
    </div>
  );
}
