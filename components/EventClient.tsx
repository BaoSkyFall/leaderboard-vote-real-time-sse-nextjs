"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/config/roster";
import type { Snapshot } from "@/lib/types";
import { DEFAULT_DURATION_SEC } from "@/config/event";
import Lobby from "./Lobby";
import Voting from "./Voting";
import Results from "./Results";
import TopBar from "./TopBar";

interface EventClientProps {
  readonly userId: string;
  readonly role: Role;
}

const EMPTY_SNAPSHOT: Snapshot = {
  state: "idle",
  endsAt: null,
  serverNow: Date.now(),
  durationSec: DEFAULT_DURATION_SEC,
  ranking: [],
  online: 0,
};

export default function EventClient({ userId, role }: EventClientProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);
  const [connected, setConnected] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Open the SSE connection. EventSource auto-reconnects on drop; each
  // (re)connection immediately receives a fresh snapshot → self-healing.
  useEffect(() => {
    const es = new EventSource("/api/stream");
    esRef.current = es;

    es.addEventListener("snapshot", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as Snapshot;
        setSnapshot(data);
        setConnected(true);
      } catch {
        /* ignore malformed */
      }
    });

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  // Persist "I voted" across reconnects/state changes for this tab.
  useEffect(() => {
    const key = `gem_voted_${userId}`;
    const stored = window.localStorage.getItem(key);
    if (stored) setVotedFor(stored);
  }, [userId]);

  const handleVoted = useCallback(
    (candidateId: string) => {
      setVotedFor(candidateId);
      window.localStorage.setItem(`gem_voted_${userId}`, candidateId);
    },
    [userId],
  );

  // When the election resets to idle, clear local vote memory.
  useEffect(() => {
    if (snapshot.state === "idle") {
      setVotedFor(null);
      window.localStorage.removeItem(`gem_voted_${userId}`);
    }
  }, [snapshot.state, userId]);

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }, [router]);

  return (
    <div className="relative min-h-screen">
      <div className="slash-pattern fixed inset-0 z-0" />
      <TopBar
        state={snapshot.state}
        connected={connected}
        role={role}
        onLogout={logout}
      />

      {snapshot.state === "idle" && (
        <Lobby snapshot={snapshot} role={role} />
      )}

      {snapshot.state === "running" && (
        <Voting
          snapshot={snapshot}
          role={role}
          votedFor={votedFor}
          onVoted={handleVoted}
        />
      )}

      {snapshot.state === "ended" && <Results snapshot={snapshot} />}
    </div>
  );
}
