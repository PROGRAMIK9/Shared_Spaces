"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const GameWrapper = dynamic(
  () => import("@/components/game/GameWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d0b1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
          <p className="text-sm text-violet-300/70">Loading workspace…</p>
        </div>
      </div>
    ),
  }
);

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name") || "Player";

  return <GameWrapper playerName={playerName} />;
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#0d0b1a]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
