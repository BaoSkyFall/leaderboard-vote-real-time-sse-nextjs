"use client";

import Image from "next/image";
import type { Role } from "@/config/roster";
import type { ElectionState } from "@/lib/types";

interface TopBarProps {
  readonly state: ElectionState;
  readonly connected: boolean;
  readonly role: Role;
  readonly onLogout: () => void;
}

export default function TopBar({ state, connected, role, onLogout }: TopBarProps) {
  const live = state === "running";
  return (
    <header className="fixed left-1/2 top-0 z-50 h-16 w-full max-w-[480px] -translate-x-1/2 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-margin-mobile">
        {/* Left: connection indicator */}
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            connected ? "bg-primary-container" : "bg-error-red"
          }`}
          aria-label={connected ? "Đã kết nối" : "Mất kết nối"}
        />

        {/* Center: GEM logo */}
        <Image
          src="/logo-white.png"
          alt="GEM"
          width={72}
          height={30}
          className="h-[30px] w-auto object-contain"
        />

        {/* Right: status badges + logout */}
        <div className="flex items-center gap-sm">
          {live && (
            <span className="font-label-caps text-label-caps font-bold text-error-red">
              LIVE
            </span>
          )}
          {role === "btc" && (
            <span className="rounded-full border border-outline-variant/50 px-2 py-0.5 font-label-caps text-[10px] uppercase text-secondary">
              BTC
            </span>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="font-label-caps text-[10px] uppercase text-on-surface-variant/70 transition-colors hover:text-on-surface"
          >
            Thoát
          </button>
        </div>
      </div>
    </header>
  );
}
