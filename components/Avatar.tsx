"use client";

import { useState } from "react";

interface AvatarProps {
  readonly src: string;
  readonly name: string;
  readonly className?: string;
}

// Deterministic accent color from the name for the fallback initial avatar.
const FALLBACK_BG = ["#1452f5", "#e0731d", "#0B2A8F", "#1A2540"];

function pickColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return FALLBACK_BG[h % FALLBACK_BG.length];
}

/** Avatar image with a graceful initial-letter fallback when the file is absent. */
export default function Avatar({ src, name, className = "" }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (errored) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-full font-bold text-white ${className}`}
        style={{ backgroundColor: pickColor(name) }}
        aria-label={name}
      >
        {initial}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className={`h-full w-full rounded-full object-cover ${className}`}
    />
  );
}
