"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      setIsEntering(true);
      const encoded = encodeURIComponent(name.trim());
      router.push(`/workspace?name=${encoded}`);
    },
    [name, router]
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float absolute left-1/4 top-1/4 h-96 w-96 rounded-full opacity-30 blur-[100px]"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent)" }}
        />
        <div
          className="animate-float absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full opacity-25 blur-[100px]"
          style={{
            background: "radial-gradient(circle, #67e8f9, transparent)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main card */}
      <div className="animate-fade-in-up relative z-10 mx-4 w-full max-w-md">
        <div className="animate-pulse-glow rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-2xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h1 className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              GatherCraft
            </h1>
            <p className="mt-2 text-center text-sm text-gray-500">
              Walk, talk, and collaborate in your virtual office
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleEnter} className="space-y-4">
            <div>
              <label
                htmlFor="name-input"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                Your Display Name
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name…"
                autoFocus
                maxLength={24}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:border-violet-500/40 focus:bg-white focus:shadow-[0_0_20px_rgba(124,58,237,0.1)]"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isEntering}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-200 hover:shadow-violet-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isEntering ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Entering…
                  </span>
                ) : (
                  "Enter Workspace →"
                )}
              </span>
              <div className="animate-shimmer absolute inset-0" />
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: "🎙️", label: "Spatial Audio" },
              { icon: "🗺️", label: "2D Office" },
              { icon: "🔒", label: "Private Rooms" },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-2 py-3 transition-colors hover:border-gray-200 hover:bg-gray-100"
              >
                <span className="text-lg">{feat.icon}</span>
                <span className="text-[10px] font-medium text-gray-500">
                  {feat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-gray-400">
          Built with Next.js • Phaser 3 • Colyseus • LiveKit
        </p>
      </div>
    </div>
  );
}
