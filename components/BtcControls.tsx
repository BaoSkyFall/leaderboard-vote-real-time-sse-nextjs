"use client";

import { useState } from "react";
import type { ElectionState } from "@/lib/types";
import {
  DEFAULT_DURATION_SEC,
  MIN_DURATION_SEC,
  MAX_DURATION_SEC,
} from "@/config/event";

interface BtcControlsProps {
  readonly state: ElectionState;
  /** Compact mode renders only a Stop button (used during running state). */
  readonly compact?: boolean;
}

const MIN_MIN = Math.max(1, Math.round(MIN_DURATION_SEC / 60));
const MAX_MIN = Math.floor(MAX_DURATION_SEC / 60);

export default function BtcControls({ state, compact = false }: BtcControlsProps) {
  const [minutes, setMinutes] = useState(Math.round(DEFAULT_DURATION_SEC / 60));
  const [busy, setBusy] = useState(false);

  const clamp = (m: number) => Math.min(MAX_MIN, Math.max(MIN_MIN, m));

  async function post(path: string, body?: unknown) {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  const start = () => post("/api/admin/start", { durationSec: clamp(minutes) * 60 });
  const stop = () => post("/api/admin/stop");
  const reset = () => post("/api/admin/reset");

  // Compact: only DỪNG button, shown inside the voting footer area
  if (compact) {
    return (
      <button
        type="button"
        onClick={stop}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-highest px-5 py-2.5 font-body-bold text-sm text-on-surface active:scale-95 disabled:opacity-50"
      >
        ■ DỪNG
      </button>
    );
  }

  // Full panel — matches waiting.html organizer section exactly
  return (
    <section className="glass-card fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 rounded-t-3xl border-t border-outline-variant/30 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto space-y-md">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            ĐIỀU KHIỂN BTC (ORGANIZER)
          </span>
          <span className="text-sm text-on-surface-variant">⚙</span>
        </div>

        {/* Duration stepper */}
        <div className="flex items-center gap-gutter rounded-xl border border-outline-variant/10 bg-surface-container-lowest/50 p-3">
          <div className="flex-grow">
            <label className="mb-1 block font-label-caps text-[10px] uppercase text-on-surface-variant">
              THỜI LƯỢNG (PHÚT)
            </label>
            <input
              type="number"
              min={MIN_MIN}
              max={MAX_MIN}
              value={minutes}
              onChange={(e) => setMinutes(clamp(Number(e.target.value) || MIN_MIN))}
              className="w-full border-none bg-transparent p-0 font-headline-md text-[32px] font-semibold leading-tight text-primary focus:outline-none focus:ring-0"
            />
          </div>
          <div className="h-10 w-px bg-outline-variant/20" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMinutes((m) => clamp(m - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-xl text-on-surface active:scale-95 transition-transform"
              aria-label="Giảm thời lượng"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setMinutes((m) => clamp(m + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-xl text-on-surface active:scale-95 transition-transform"
              aria-label="Tăng thời lượng"
            >
              +
            </button>
          </div>
        </div>

        {/* DỪNG / BẮT ĐẦU grid — col-span 1:2 */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={stop}
            disabled={busy || state !== "running"}
            className="col-span-1 flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-highest py-3.5 font-body-bold text-on-surface active:scale-95 transition-all disabled:opacity-40"
          >
            ■ DỪNG
          </button>
          <button
            type="button"
            onClick={start}
            disabled={busy}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-primary-container py-3.5 font-body-bold text-on-primary-container shadow-lg shadow-primary-container/20 active:scale-95 transition-all disabled:opacity-60"
          >
            ▶ {busy ? "ĐANG KÍCH HOẠT..." : "BẮT ĐẦU"}
          </button>
        </div>

        {/* Reset link */}
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="flex w-full items-center justify-center gap-1 py-1 font-label-caps text-[10px] uppercase text-on-surface-variant opacity-60 transition-opacity hover:opacity-100 disabled:opacity-40"
        >
          ↻ RESET TRẬN ĐẤU
        </button>
      </div>
    </section>
  );
}
