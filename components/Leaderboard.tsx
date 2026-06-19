"use client";

import { AnimatePresence } from "framer-motion";
import type { RankingEntry } from "@/lib/types";
import CandidateCard from "./CandidateCard";

interface LeaderboardProps {
  readonly ranking: RankingEntry[];
  readonly votedFor: string | null;
}

export default function Leaderboard({ ranking, votedFor }: LeaderboardProps) {
  const leaderCount = ranking[0]?.count ?? 0;
  return (
    <div className="flex flex-col gap-md">
      <AnimatePresence>
        {ranking.map((entry) => (
          <CandidateCard
            key={entry.candidateId}
            entry={entry}
            leaderCount={leaderCount}
            selected={votedFor === entry.candidateId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
