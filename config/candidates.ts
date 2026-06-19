// The 3 rap battle candidates. Avatars live under /public/avatars/{id}.png
// (a fallback initial avatar is rendered by <Avatar/> if the file is absent).

export interface Candidate {
  readonly id: string;
  readonly rapName: string;
  readonly avatar: string;
}

export const CANDIDATES: ReadonlyArray<Candidate> = [
  { id: "sky-b", rapName: "SkyB", avatar: "/avatars/skyB.png" },
  { id: "dcnl", rapName: "DCNL", avatar: "/avatars/dcnl.png" },
  { id: "ly-tong", rapName: "Lý Tổng", avatar: "/avatars/lytong.png" },
];

export const CANDIDATE_IDS: ReadonlyArray<string> = CANDIDATES.map((c) => c.id);

export function getCandidate(id: string): Candidate | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
