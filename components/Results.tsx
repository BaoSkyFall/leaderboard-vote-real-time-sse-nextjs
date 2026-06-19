"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import Image from "next/image";
import type { RankingEntry, Snapshot } from "@/lib/types";
import Avatar from "./Avatar";

interface ResultsProps {
  readonly snapshot: Snapshot;
}

const CONFETTI_COLORS = ["#1452f5", "#e0731d", "#b7c4ff", "#ffb68a", "#ffffff"];

function fireConfetti() {
  const end = Date.now() + 2500;
  // Initial burst from center
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { x: 0.5, y: 0.3 },
    colors: CONFETTI_COLORS,
    startVelocity: 50,
  });
  // Continuous side streams
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: CONFETTI_COLORS,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: CONFETTI_COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ---- Rank #1 center column ----
function PodiumFirst({ entry }: { entry: RankingEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="z-20 flex flex-[1.3] flex-col items-center"
    >
      <div className="relative mb-4 animate-float">
        {/* Crown star above avatar */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-secondary-container text-4xl">
          ⭐
        </div>
        {/* Avatar with orange glow border */}
        <div
          className="h-28 w-28 overflow-hidden rounded-full border-4 border-secondary-container"
          style={{ boxShadow: "0 0 40px 5px rgba(224,115,29,0.4)" }}
        >
          <Avatar src={entry.avatar} name={entry.rapName} />
        </div>
        {/* CHAMPION badge below avatar */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary-container px-3 py-1 shadow-lg">
          <span className="whitespace-nowrap font-label-caps text-[10px] text-white">
            CHAMPION
          </span>
        </div>
      </div>

      {/* Podium block #1 — tallest, orange border */}
      <div
        className="podium-rank-1 relative flex h-40 w-full flex-col items-center justify-start overflow-hidden rounded-t-2xl px-2 pt-6 text-center shadow-2xl"
      >
        <div className="absolute inset-0 bg-secondary-container/5 pointer-events-none" />
        <span className="mb-1 font-headline-md text-xl text-on-surface">
          {entry.rapName}
        </span>
        <span className="font-stat-lg-mobile text-4xl tracking-tight text-secondary-container tabular-nums">
          {entry.count.toLocaleString("vi-VN")}
        </span>
        <span className="mt-1 font-label-caps text-[10px] text-on-surface-variant">
          PHIẾU BẦU
        </span>
      </div>
    </motion.div>
  );
}

// ---- Rank #2 or #3 side columns ----
function PodiumSide({
  entry,
  position,
}: {
  entry: RankingEntry;
  position: 2 | 3;
}) {
  const delay = position === 2 ? 0.3 : 0.5;
  const avatarSize = position === 2 ? "h-16 w-16" : "h-14 w-14";
  const borderColor = position === 2 ? "border-primary" : "border-outline";
  const colHeight = position === 2 ? "h-24" : "h-16";
  const countColor = position === 2 ? "text-primary" : "text-outline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className="flex flex-1 flex-col items-center"
    >
      <div className="relative mb-3">
        <div
          className={`${avatarSize} overflow-hidden rounded-full border-2 ${borderColor}`}
        >
          <Avatar src={entry.avatar} name={entry.rapName} />
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full border border-outline-variant bg-surface-container-highest px-1.5">
          <span className="text-[10px] font-bold text-on-surface-variant">
            #{position}
          </span>
        </div>
      </div>
      <div
        className={`podium-rank-${position} ${colHeight} flex w-full flex-col items-center justify-center rounded-t-xl p-2 text-center`}
      >
        <span className="w-full truncate font-body-bold text-xs text-on-surface">
          {entry.rapName}
        </span>
        <span className={`font-stat-lg-mobile tabular-nums ${countColor} ${position === 2 ? "text-lg" : "text-base"}`}>
          {entry.count.toLocaleString("vi-VN")}
        </span>
      </div>
    </motion.div>
  );
}

export default function Results({ snapshot }: ResultsProps) {
  useEffect(() => {
    fireConfetti();
  }, []);

  const byRank = (r: number) => snapshot.ranking.find((e) => e.rank === r);
  const r1 = byRank(1);
  const r2 = byRank(2);
  const r3 = byRank(3);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center overflow-hidden px-margin-mobile pb-32 pt-24">
      {/* Atmospheric background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[150%] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      {/* Header with logo */}
      <div className="mb-2 flex items-center gap-2">
        <Image
          src="/logo-white.png"
          alt="GEM"
          width={60}
          height={25}
          className="h-[25px] w-auto object-contain opacity-70"
        />
        <h1 className="font-title-md text-title-md uppercase tracking-tighter text-primary">
          Kết quả chung cuộc
        </h1>
      </div>

      {/* Podium */}
      <div className="mt-8 flex w-full max-w-[400px] flex-col items-center">
        <div className="mb-12 flex w-full items-end justify-center gap-2">
          {/* Left: #2 */}
          {r2 ? <PodiumSide entry={r2} position={2} /> : <div className="flex-1" />}
          {/* Center: #1 — tallest */}
          {r1 ? <PodiumFirst entry={r1} /> : <div className="flex-[1.3]" />}
          {/* Right: #3 */}
          {r3 ? <PodiumSide entry={r3} position={3} /> : <div className="flex-1" />}
        </div>

        {/* Celebratory text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-8 px-4 text-center"
        >
          <h2 className="mb-2 font-headline-md text-headline-md-mobile text-on-surface">
            Chúc mừng nhà vô địch!
          </h2>
          <p className="font-body-base text-on-surface-variant opacity-80">
            Chiến thắng thuyết phục với màn trình diễn bùng nổ tại sân khấu đêm nay.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
