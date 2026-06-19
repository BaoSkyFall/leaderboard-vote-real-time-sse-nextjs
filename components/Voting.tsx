"use client";

import { useState } from "react";
import type { Role } from "@/config/roster";
import type { Snapshot } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";
import Leaderboard from "./Leaderboard";
import VoteSheet from "./VoteSheet";
import BtcControls from "./BtcControls";

interface VotingProps {
  readonly snapshot: Snapshot;
  readonly role: Role;
  readonly votedFor: string | null;
  readonly onVoted: (candidateId: string) => void;
}

export default function Voting({
  snapshot,
  role,
  votedFor,
  onVoted,
}: VotingProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasVoted = votedFor !== null;

  return (
    <>
      <main className="relative z-10 mx-auto min-h-screen w-full max-w-[480px] px-margin-mobile pb-44 pt-24">
        <CountdownTimer snapshot={snapshot} />
        <Leaderboard ranking={snapshot.ranking} votedFor={votedFor} />
      </main>

      {/* Sticky bottom action area */}
      <footer className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2">
        <div className="space-y-3 px-margin-mobile pb-lg pt-2">
          {role === "btc" && (
            <div className="flex justify-center">
              <BtcControls state={snapshot.state} compact />
            </div>
          )}
          {hasVoted ? (
            <button
              type="button"
              disabled
              className="glow-blue flex h-[52px] w-full items-center justify-center gap-sm rounded-xl border-2 border-primary-container bg-primary-container/20 font-body-bold text-lg text-primary"
            >
              ✓ ĐÃ BÌNH CHỌN
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex h-[52px] w-full items-center justify-center gap-sm rounded-xl bg-primary-container font-body-bold text-lg text-white shadow-[0_8px_30px_rgba(20,82,245,0.4)] transition-transform active:scale-[0.98]"
            >
              🗳 BỎ PHIẾU
            </button>
          )}
        </div>
      </footer>

      {sheetOpen && !hasVoted && (
        <VoteSheet
          ranking={snapshot.ranking}
          onClose={() => setSheetOpen(false)}
          onVoted={(id) => {
            onVoted(id);
            setSheetOpen(false);
          }}
        />
      )}
    </>
  );
}
