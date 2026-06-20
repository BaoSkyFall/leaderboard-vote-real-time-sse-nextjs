// Data layer with two interchangeable backends, selected at runtime:
//  - Upstash Redis  (when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set)
//  - In-memory singleton (zero-config local dev / fallback)
//
// The server is the authority for the election clock. A "running" election whose
// endsAt has passed is reported as "ended" (auto-close on read), and the stored
// state is lazily corrected.

import { Redis } from "@upstash/redis";
import { CANDIDATES, CANDIDATE_IDS } from "@/config/candidates";
import { DEFAULT_DURATION_SEC } from "@/config/event";
import type { Election, ElectionState, RankingEntry } from "./types";

// ---------------------------------------------------------------------------
// Redis keys
// ---------------------------------------------------------------------------
const K_STATE = "election:state";
const K_ENDS_AT = "election:endsAt";
const K_DURATION = "election:durationSec";
const K_TALLY = "votes:tally"; // hash candidateId -> count
const K_VOTERS = "votes:voters"; // set of userId
const K_ONLINE = "presence:online"; // sorted set: member=userId, score=last-ping ms
const kTs = (candidateId: string) => `votes:ts:${candidateId}`; // list of epoch ms

// Presence is CLIENT-DRIVEN: the browser pings ~every 4s while on the page.
// A user counts as online for this long after their last ping. When they close
// the tab the pings stop and they fall out of the count within the TTL. This is
// the only model that works on serverless (Vercel) — the server cannot rely on
// detecting SSE disconnects, so it must not be the source of truth for presence.
const ONLINE_TTL_MS = 12_000;

// ---------------------------------------------------------------------------
// Backend selection
// ---------------------------------------------------------------------------
// Accept both the native Upstash env names and the names Vercel's
// Marketplace/KV integration injects (KV_REST_API_*), so adding the Upstash
// integration on Vercel works with zero manual env renaming. Without a shared
// store, serverless instances each keep isolated in-memory state and the
// election/online-count never propagate — so this MUST be set in production.
const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const hasRedis = Boolean(REDIS_URL && REDIS_TOKEN);

const redis = hasRedis
  ? new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
  : null;

// ---------------------------------------------------------------------------
// In-memory backend (module singleton). Survives across requests within a
// single Node process — perfect for local dev with no env.
// ---------------------------------------------------------------------------
interface MemoryStore {
  state: ElectionState;
  endsAt: number | null;
  durationSec: number;
  tally: Map<string, number>;
  voters: Set<string>;
  ts: Map<string, number[]>; // candidateId -> sorted epoch ms list
  online: Map<string, number>; // userId -> last-ping epoch ms
}

// Use globalThis so the singleton survives Next.js dev hot-reloads.
const globalForStore = globalThis as unknown as { __gemStore?: MemoryStore };

const mem: MemoryStore =
  globalForStore.__gemStore ??
  (globalForStore.__gemStore = {
    state: "idle",
    endsAt: null,
    durationSec: DEFAULT_DURATION_SEC,
    tally: new Map(),
    voters: new Set(),
    ts: new Map(),
    online: new Map(),
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toState(raw: unknown): ElectionState {
  return raw === "running" || raw === "ended" ? raw : "idle";
}

function toNum(raw: unknown, fallback: number): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

// ---------------------------------------------------------------------------
// Election lifecycle
// ---------------------------------------------------------------------------
export async function getElection(): Promise<Election> {
  let state: ElectionState;
  let endsAt: number | null;
  let durationSec: number;

  if (redis) {
    const [rState, rEndsAt, rDuration] = await Promise.all([
      redis.get(K_STATE),
      redis.get(K_ENDS_AT),
      redis.get(K_DURATION),
    ]);
    state = toState(rState);
    endsAt = rEndsAt == null ? null : toNum(rEndsAt, 0);
    durationSec = toNum(rDuration, DEFAULT_DURATION_SEC);
  } else {
    state = mem.state;
    endsAt = mem.endsAt;
    durationSec = mem.durationSec;
  }

  // Auto-close on read: a running election whose time is up is "ended".
  if (state === "running" && endsAt !== null && Date.now() >= endsAt) {
    state = "ended";
    // Lazily persist the corrected state (best-effort).
    if (redis) {
      void redis.set(K_STATE, "ended");
    } else {
      mem.state = "ended";
    }
  }

  return { state, durationSec, endsAt };
}

export async function startElection(durationSec: number): Promise<Election> {
  const endsAt = Date.now() + durationSec * 1000;
  if (redis) {
    // Fresh tally + voters on every start.
    await clearTally();
    await Promise.all([
      redis.set(K_STATE, "running"),
      redis.set(K_ENDS_AT, endsAt),
      redis.set(K_DURATION, durationSec),
    ]);
  } else {
    mem.tally.clear();
    mem.voters.clear();
    mem.ts.clear();
    mem.state = "running";
    mem.endsAt = endsAt;
    mem.durationSec = durationSec;
  }
  return { state: "running", durationSec, endsAt };
}

export async function stopElection(): Promise<Election> {
  if (redis) {
    await redis.set(K_STATE, "ended");
    const election = await getElection();
    return { ...election, state: "ended" };
  }
  mem.state = "ended";
  return { state: "ended", durationSec: mem.durationSec, endsAt: mem.endsAt };
}

export async function resetElection(): Promise<Election> {
  if (redis) {
    await clearTally();
    await Promise.all([
      redis.set(K_STATE, "idle"),
      redis.del(K_ENDS_AT),
      redis.set(K_DURATION, DEFAULT_DURATION_SEC),
    ]);
  } else {
    mem.tally.clear();
    mem.voters.clear();
    mem.ts.clear();
    mem.state = "idle";
    mem.endsAt = null;
    mem.durationSec = DEFAULT_DURATION_SEC;
  }
  return { state: "idle", durationSec: DEFAULT_DURATION_SEC, endsAt: null };
}

async function clearTally(): Promise<void> {
  if (!redis) return;
  await Promise.all([
    redis.del(K_TALLY),
    redis.del(K_VOTERS),
    ...CANDIDATE_IDS.map((id) => redis.del(kTs(id))),
  ]);
}

// ---------------------------------------------------------------------------
// Tally + voting
// ---------------------------------------------------------------------------
export async function getTally(): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const id of CANDIDATE_IDS) result[id] = 0;

  if (redis) {
    const raw = (await redis.hgetall(K_TALLY)) as Record<string, unknown> | null;
    if (raw) {
      for (const [id, val] of Object.entries(raw)) {
        if (id in result) result[id] = toNum(val, 0);
      }
    }
  } else {
    for (const id of CANDIDATE_IDS) result[id] = mem.tally.get(id) ?? 0;
  }
  return result;
}

export async function hasVoted(userId: string): Promise<boolean> {
  const uid = userId.trim().toLowerCase();
  if (redis) {
    return (await redis.sismember(K_VOTERS, uid)) === 1;
  }
  return mem.voters.has(uid);
}

export type CastVoteResult =
  | { ok: true }
  | { ok: false; reason: "already_voted" | "unknown_candidate" };

/**
 * Atomically record a vote:
 *  - rejects if the user already voted
 *  - rejects unknown candidate
 *  - records the vote timestamp (epoch ms) for tie-breaking
 */
export async function castVote(
  userId: string,
  candidateId: string,
): Promise<CastVoteResult> {
  const uid = userId.trim().toLowerCase();
  if (!CANDIDATE_IDS.includes(candidateId)) {
    return { ok: false, reason: "unknown_candidate" };
  }
  const now = Date.now();

  if (redis) {
    // sadd returns the number of NEW members added. 0 => already voted.
    const added = await redis.sadd(K_VOTERS, uid);
    if (added === 0) return { ok: false, reason: "already_voted" };
    await Promise.all([
      redis.hincrby(K_TALLY, candidateId, 1),
      redis.rpush(kTs(candidateId), now),
    ]);
    return { ok: true };
  }

  if (mem.voters.has(uid)) return { ok: false, reason: "already_voted" };
  mem.voters.add(uid);
  mem.tally.set(candidateId, (mem.tally.get(candidateId) ?? 0) + 1);
  const list = mem.ts.get(candidateId) ?? [];
  list.push(now);
  mem.ts.set(candidateId, list);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Ranking with tie-break
// ---------------------------------------------------------------------------
async function getTimestamps(candidateId: string): Promise<number[]> {
  if (redis) {
    const raw = (await redis.lrange(kTs(candidateId), 0, -1)) as unknown[];
    return raw.map((v) => toNum(v, 0)).sort((a, b) => a - b);
  }
  return [...(mem.ts.get(candidateId) ?? [])].sort((a, b) => a - b);
}

/**
 * Candidates sorted by count desc. Tie-break: the candidate who *reached* the
 * tying count earliest wins (compare the count-th vote timestamp; earlier wins).
 */
export async function getRanking(): Promise<RankingEntry[]> {
  const tally = await getTally();
  const tsByCandidate: Record<string, number[]> = {};
  await Promise.all(
    CANDIDATES.map(async (c) => {
      tsByCandidate[c.id] = await getTimestamps(c.id);
    }),
  );

  const sorted = [...CANDIDATES].sort((a, b) => {
    const ca = tally[a.id] ?? 0;
    const cb = tally[b.id] ?? 0;
    if (cb !== ca) return cb - ca; // higher count first

    // Tie: compare the timestamp at which each reached the shared count.
    // The count-th vote is at index (count - 1). Earlier => ranks higher.
    if (ca === 0) return 0; // both zero, stable order
    const ta = tsByCandidate[a.id]?.[ca - 1] ?? Number.POSITIVE_INFINITY;
    const tb = tsByCandidate[b.id]?.[cb - 1] ?? Number.POSITIVE_INFINITY;
    return ta - tb;
  });

  return sorted.map((c, i) => ({
    candidateId: c.id,
    rapName: c.rapName,
    avatar: c.avatar,
    count: tally[c.id] ?? 0,
    rank: i + 1,
  }));
}

// ---------------------------------------------------------------------------
// Presence — CLIENT-DRIVEN heartbeat with TTL (serverless-safe).
//
// The browser calls markOnline (POST /api/presence) every ~4s while on the
// page, and removeOnline (sendBeacon on pagehide) for a clean exit. The count
// is the number of users whose last ping is within ONLINE_TTL_MS. Redis native
// score pruning means a user who stops pinging (closed tab / crashed / lost
// network) falls out within the TTL with no server-side disconnect detection.
// ---------------------------------------------------------------------------

/** Record a heartbeat ping for a user (refreshes their last-seen time). */
export async function markOnline(userId: string): Promise<void> {
  const uid = userId.trim().toLowerCase();
  if (!uid) return;
  const now = Date.now();
  if (redis) {
    await redis.zadd(K_ONLINE, { score: now, member: uid });
  } else {
    mem.online.set(uid, now);
  }
}

/** Remove a user from presence immediately (clean tab close / logout). */
export async function removeOnline(userId: string): Promise<void> {
  const uid = userId.trim().toLowerCase();
  if (!uid) return;
  if (redis) {
    await redis.zrem(K_ONLINE, uid);
  } else {
    mem.online.delete(uid);
  }
}

/** Number of users whose last ping is within the TTL window. */
export async function getOnlineCount(): Promise<number> {
  const now = Date.now();
  const cutoff = now - ONLINE_TTL_MS;
  if (redis) {
    // Drop everyone who stopped pinging, then count who remains.
    await redis.zremrangebyscore(K_ONLINE, 0, cutoff);
    return await redis.zcard(K_ONLINE);
  }
  let count = 0;
  for (const [uid, seen] of mem.online) {
    if (seen >= cutoff) count++;
    else mem.online.delete(uid);
  }
  return count;
}
