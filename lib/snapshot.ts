import { getElection, getRanking, getOnlineCount } from "./store";
import type { Snapshot } from "./types";

/** Build a full snapshot of the current election state for SSE / initial render. */
export async function buildSnapshot(): Promise<Snapshot> {
  const [election, ranking, online] = await Promise.all([
    getElection(),
    getRanking(),
    getOnlineCount(),
  ]);
  return {
    state: election.state,
    endsAt: election.endsAt,
    serverNow: Date.now(),
    durationSec: election.durationSec,
    ranking,
    online,
  };
}
