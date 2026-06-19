"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { RankingEntry } from "@/lib/types";
import Avatar from "./Avatar";

interface VoteSheetProps {
  readonly ranking: RankingEntry[];
  readonly onClose: () => void;
  readonly onVoted: (candidateId: string) => void;
}

export default function VoteSheet({ ranking, onClose, onVoted }: VoteSheetProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show candidates in stable id order inside the sheet (not by rank) so the
  // pick targets stay put while the user decides.
  const candidates = [...ranking].sort((a, b) =>
    a.candidateId.localeCompare(b.candidateId),
  );

  async function confirm() {
    if (!picked || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: picked }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 409 already-voted: treat as voted (irrevocable) and close.
        if (res.status === 409 && data.error?.includes("đã bình chọn")) {
          onVoted(picked);
          return;
        }
        setError(data.error || "Không thể bình chọn");
        setBusy(false);
        return;
      }
      onVoted(picked);
    } catch {
      setError("Có lỗi xảy ra, thử lại");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
        className="glass-card relative w-full max-w-[480px] rounded-t-3xl border-t border-outline-variant/30 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-outline-variant/50" />
        <h3 className="mb-1 text-center font-title-md text-title-md text-white">
          Chọn thí sinh
        </h3>
        <p className="mb-5 text-center font-label-caps text-label-caps uppercase text-on-surface-variant">
          1 phiếu • không đổi được
        </p>

        <div className="space-y-3">
          {candidates.map((c) => {
            const isPicked = picked === c.candidateId;
            return (
              <button
                key={c.candidateId}
                type="button"
                onClick={() => setPicked(c.candidateId)}
                className={`flex w-full items-center gap-md rounded-xl border-2 p-3 text-left transition-all active:scale-[0.99] ${
                  isPicked
                    ? "glow-blue border-primary-container bg-primary-container/20"
                    : "border-outline-variant/30 bg-surface-container"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-full border-2 p-0.5 ${
                    isPicked ? "border-primary-container" : "border-outline"
                  }`}
                >
                  <Avatar src={c.avatar} name={c.rapName} />
                </div>
                <span className="flex-grow font-body-bold text-body-bold text-white">
                  {c.rapName}
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${
                    isPicked
                      ? "border-primary-container bg-primary-container text-white"
                      : "border-outline-variant text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 text-center font-label-caps text-label-caps text-error-red">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={confirm}
          disabled={!picked || busy}
          className="mt-5 flex h-[52px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container font-body-bold text-lg text-white shadow-[0_8px_30px_rgba(20,82,245,0.4)] transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Đang gửi..." : "Xác nhận bình chọn"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 font-label-caps text-label-caps uppercase text-on-surface-variant/70"
        >
          Huỷ
        </button>
      </motion.div>
    </div>
  );
}
