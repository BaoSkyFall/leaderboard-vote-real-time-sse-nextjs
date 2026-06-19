// Hardcoded roster of internal GEM employees who may log in.
// Lookup is case-insensitive and trimmed (see lib/session.ts).
// Replace these placeholder IDs with the real list later.

export type Role = "voter" | "btc";

export interface RosterUser {
  readonly id: string;
  readonly role: Role;
}

export const ROSTER: ReadonlyArray<RosterUser> = [
  { id: "hoangnk", role: "voter" },
  { id: "congnt", role: "voter" },
  { id: "nguyenpv", role: "voter" },
  { id: "quanth", role: "voter" },
  { id: "huycng", role: "voter" },
  { id: "minhnh1", role: "voter" },
  { id: "vilnt", role: "voter" },
  { id: "zisse.nguyen", role: "voter" },
  { id: "baonn", role: "voter" },
  { id: "nghihh", role: "btc" },
  { id: "hanhbv", role: "voter" },
  { id: "martin.tran", role: "voter" },
  { id: "anlv", role: "voter" },
  { id: "phuongttt", role: "voter" },
  { id: "quangtv1", role: "voter" },
  { id: "dungvd", role: "voter" },
  { id: "anhlt2", role: "voter" },
  { id: "truongln", role: "voter" },
  { id: "quoclt", role: "voter" },
  { id: "hoanv", role: "voter" },
  { id: "quanla", role: "voter" },
  { id: "huynpg", role: "voter" },
  { id: "baoppq", role: "btc" },
  { id: "ulbertvo", role: "voter" },
  { id: "hanhptn", role: "voter" },
  { id: "huybna", role: "voter" },
  { id: "anhdm", role: "btc" },
  { id: "phucptn", role: "btc" },
];

/** Find a roster user by id (case-insensitive, trimmed). */
export function findRosterUser(rawId: string): RosterUser | undefined {
  const needle = rawId.trim().toLowerCase();
  if (!needle) return undefined;
  return ROSTER.find((u) => u.id.toLowerCase() === needle);
}
