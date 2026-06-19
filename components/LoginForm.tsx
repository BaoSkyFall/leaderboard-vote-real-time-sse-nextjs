"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const shake = () => {
    const el = btnRef.current;
    if (!el) return;
    el.classList.add("animate-shake");
    window.setTimeout(() => el.classList.remove("animate-shake"), 400);
  };

  async function handleLogin() {
    if (loading) return;
    const id = value.trim();
    if (!id) {
      setError("ID không hợp lệ");
      shake();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "ID không hợp lệ");
        shake();
        setLoading(false);
        return;
      }
      router.replace("/event");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, thử lại");
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-between overflow-y-auto px-margin-mobile py-xl">
      {/* Header — GEM white logo (priority: above the fold) */}
      <header className="flex w-full justify-center pt-md">
        <Image
          src="/logo-white.png"
          alt="GEM Wordmark"
          width={120}
          height={50}
          priority
          className="h-10 w-auto object-contain"
        />
      </header>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-xl py-xl">
        {/* Hero headline */}
        <div className="space-y-sm text-center">
          <h1 className="font-display-lg text-display-lg-mobile uppercase tracking-tight text-on-surface">
            RAP BATTLE
            <br />
            <span className="text-primary-container">LIVE VOTE</span>
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant">
            Nhập ID nhân viên để vào
          </p>
        </div>

        {/* Login form — matches login.html structure exactly */}
        <div className="w-full space-y-lg">
          <div className="relative w-full">
            <label
              htmlFor="employee-id"
              className="mb-xs block font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant"
            >
              Employee ID
            </label>
            <div
              className={`relative rounded-t-lg bg-surface-container-lowest/50 ${
                error ? "bg-error-container/10" : ""
              }`}
            >
              <input
                id="employee-id"
                type="text"
                inputMode="text"
                autoCapitalize="off"
                autoComplete="off"
                spellCheck={false}
                value={value}
                placeholder="vd: quanla"
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                className="w-full border-none bg-transparent px-md py-md font-title-md text-title-md-mobile text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-0"
              />
              {/* Static baseline */}
              <div className="absolute bottom-0 left-0 h-[1px] w-full bg-outline-variant/30" />
              {/* Focus underline with glow */}
              <div className="input-underline absolute bottom-0 left-0 h-[2px] w-0 bg-primary-container transition-all duration-300 focus-within:w-full focus-within:[box-shadow:0_0_12px_rgba(20,82,245,0.8)]" />
            </div>
            {error && (
              <div className="mt-sm flex items-center gap-xs">
                <span className="font-label-caps text-label-caps text-error-red">
                  ⚠ {error}
                </span>
              </div>
            )}
          </div>

          <button
            ref={btnRef}
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary-glow flex h-[56px] w-full items-center justify-center gap-sm rounded-lg bg-primary-container font-body-bold text-body-bold uppercase tracking-widest text-on-primary transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "ĐANG VÀO..." : (
              <>VÀO <span className="ml-1 text-[20px] leading-none">→</span></>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full pb-md text-center">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant/60">
          Chỉ dành cho nhân viên nội bộ GEM
        </p>
      </footer>
    </main>
  );
}
