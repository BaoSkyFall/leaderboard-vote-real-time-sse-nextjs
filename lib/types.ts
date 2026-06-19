export type ElectionState = "idle" | "running" | "ended";

export interface Election {
  state: ElectionState;
  durationSec: number;
  endsAt: number | null; // epoch ms
}

export interface RankingEntry {
  candidateId: string;
  rapName: string;
  avatar: string;
  count: number;
  rank: number;
}

export interface Snapshot {
  state: ElectionState;
  endsAt: number | null;
  serverNow: number;
  durationSec: number;
  ranking: RankingEntry[];
  online: number;
}
