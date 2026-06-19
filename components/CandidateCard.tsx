"use client";

import { motion } from "framer-motion";
import type { RankingEntry } from "@/lib/types";
import Avatar from "./Avatar";

interface CandidateCardProps {
  readonly entry: RankingEntry;
  readonly leaderCount: number;
  readonly selected: boolean;
}

export default function CandidateCard({
  entry,
  leaderCount,
  selected,
}: CandidateCardProps) {
  const isLeader = entry.rank === 1;
  const pct = leaderCount > 0 ? Math.round((entry.count / leaderCount) * 100) : 0;

  // Container classes — matches voting.html cards exactly
  let containerClass = "bg-surface-container rounded-xl p-md border border-outline-variant/30";
  if (isLeader) {
    // #1 card: orange border, orange glow, slightly scaled up with bottom margin
    containerClass =
      "relative bg-surface-container-high rounded-xl p-md border-2 border-secondary/50 transform scale-[1.02] mb-4 overflow-hidden";
  } else if (selected) {
    // selected (not leader): blue border + blue glow
    containerClass =
      "relative bg-primary-container/20 rounded-xl p-md border-2 border-primary-container overflow-hidden";
  }

  const rankBadgeClass = isLeader
    ? "bg-secondary text-on-secondary w-7 h-7 text-lg shadow-lg"
    : selected
      ? "bg-primary-container text-white w-6 h-6 text-sm shadow-md"
      : "bg-surface-variant text-on-surface-variant w-6 h-6 text-sm shadow-md";

  const statusLabel = isLeader
    ? "Đang dẫn đầu"
    : selected
      ? "Đã chọn"
      : "Đang bám đuổi";

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={containerClass}
      style={
        isLeader
          ? { boxShadow: "0 0 25px rgba(255,138,53,0.4)" }
          : selected
            ? { boxShadow: "0 0 25px rgba(20,82,245,0.6)" }
            : undefined
      }
    >
      {/* Selected check badge (top-right corner) */}
      {selected && !isLeader && (
        <div className="absolute right-2 top-2">
          <span className="text-primary-container">✓</span>
        </div>
      )}

      <div className="mb-sm flex items-center justify-between gap-md">
        <div className="flex items-center gap-md">
          {/* Avatar + rank badge */}
          <div className="relative">
            {isLeader && (
              <span
                className="absolute -left-3 -top-3 z-10 text-secondary drop-shadow-md"
                style={{ transform: "rotate(-15deg)", fontSize: "18px" }}
                aria-hidden
              >
                ✦
              </span>
            )}
            <div
              className={`rounded-full p-0.5 bg-surface ${
                isLeader
                  ? "w-16 h-16 border-4 border-secondary"
                  : selected
                    ? "w-14 h-14 border-2 border-primary-container"
                    : "w-14 h-14 border-2 border-outline"
              }`}
            >
              <Avatar src={entry.avatar} name={entry.rapName} />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 flex items-center justify-center rounded-full font-bold ${rankBadgeClass}`}
            >
              {entry.rank}
            </div>
          </div>

          {/* Name + status */}
          <div>
            <h2
              className={`flex items-center gap-xs text-on-surface ${
                isLeader ? "font-title-md text-title-md" : "font-body-bold text-body-bold"
              }`}
            >
              {entry.rapName}
              {isLeader && (
                <span className="ml-1 scale-75 text-secondary" aria-hidden>
                  🔥
                </span>
              )}
            </h2>
            <p
              className={`font-label-caps text-label-caps uppercase tracking-widest ${
                isLeader
                  ? "text-on-surface-variant"
                  : selected
                    ? "font-bold text-primary-container"
                    : "text-on-surface-variant"
              }`}
            >
              {statusLabel}
            </p>
          </div>
        </div>

        {/* Vote count */}
        <div className="text-right">
          <div
            className={`tabular-nums ${
              isLeader
                ? "font-stat-lg-mobile text-stat-lg-mobile text-secondary"
                : "font-body-bold text-body-bold text-on-surface"
            }`}
          >
            {entry.count.toLocaleString("vi-VN")}
          </div>
          <div
            className={`font-label-caps text-label-caps ${
              isLeader ? "text-secondary/70" : "text-on-surface-variant"
            }`}
          >
            PHIẾU BẦU
          </div>
        </div>
      </div>

      {/* Progress bar toward leader */}
      <div
        className={`w-full overflow-hidden rounded-full bg-surface-container-lowest ${
          isLeader ? "h-2.5" : "h-1.5"
        }`}
      >
        <motion.div
          className={`h-full rounded-full ${
            isLeader
              ? "bg-secondary"
              : selected
                ? "bg-primary-container"
                : "bg-outline-variant"
          }`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
