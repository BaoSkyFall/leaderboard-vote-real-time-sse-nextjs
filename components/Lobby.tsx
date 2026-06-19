"use client";

import Image from "next/image";
import type { Role } from "@/config/roster";
import type { Snapshot } from "@/lib/types";
import { CANDIDATES } from "@/config/candidates";
import Avatar from "./Avatar";
import BtcControls from "./BtcControls";

interface LobbyProps {
  readonly snapshot: Snapshot;
  readonly role: Role;
}

export default function Lobby({ snapshot, role }: LobbyProps) {
  const isBtc = role === "btc";
  return (
    <main
      className={`relative z-10 mx-auto flex w-full max-w-[480px] flex-col items-center justify-center space-y-xl px-margin-mobile pt-24 ${
        isBtc ? "pb-[360px]" : "pb-32"
      }`}
    >
      {/* Online status pill — matches waiting.html */}
      <div className="flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high/80 px-4 py-1.5 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ripple rounded-full bg-secondary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
        </span>
        <span className="font-label-caps text-label-caps text-on-surface">
          {snapshot.online} ĐANG ONLINE
        </span>
      </div>

      {/* Pulsing hero ring — matches waiting.html exactly */}
      <div className="relative flex items-center justify-center py-8">
        {/* Outer gradient blur ring */}
        <div className="gradient-ring absolute h-64 w-64 animate-pulse rounded-full opacity-20 blur-2xl" />
        {/* Inner ring with blue shadow */}
        <div
          className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-primary-container"
          style={{ boxShadow: "0 0 40px rgba(20,82,245,0.3)" }}
        >
          <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-secondary/40">
            {/* Rap battle icon — black source PNG filtered to white for the dark stage */}
            <Image
              src="/rap.png"
              alt=""
              width={88}
              height={88}
              aria-hidden
              className="h-20 w-20 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-sm text-center">
        <h2 className="font-headline-md text-headline-md-mobile tracking-tight text-primary">
          Sắp bắt đầu
        </h2>
        <p className="mx-auto max-w-[280px] text-body-base leading-tight text-on-surface-variant">
          Ban tổ chức sẽ bắt đầu vote trong ít phút
        </p>
      </div>

      {/* Dimmed candidate previews — matches waiting.html structure */}
      <div className="w-full pt-4">
        <div className="flex items-end justify-around gap-2">
          {CANDIDATES.map((c, i) => {
            const central = i === 1;
            return (
              <div
                key={c.id}
                className={`flex flex-col items-center transition-all `}
              >
                {/* Avatar ring */}
                <div
                  className={`relative mb-2 rounded-full border-2 p-1 ${

                       "h-20 w-20 border-primary-container"

                  }`}
                >
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <Avatar src={c.avatar} name={c.rapName} />
                  </div>
                  {/* Lock icon on center candidate */}
                  {/*{central && (
                    <div className="absolute -right-1 -top-1 rounded-full border border-outline-variant bg-surface-container-highest p-1">
                      <span className="text-[10px] text-on-surface">🔒</span>
                    </div>
                  )}*/}
                </div>
                <span
                  className={`font-label-caps tracking-wider ${
                    central
                      ? "text-xs font-bold text-on-surface"
                      : "text-[10px] text-on-surface-variant"
                  }`}
                >
                  {c.rapName.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BTC control panel (fixed to bottom) */}
      {isBtc && <BtcControls state={snapshot.state} />}
    </main>
  );
}
