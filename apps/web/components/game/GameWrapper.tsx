"use client";

import { Rnd } from "react-rnd";
import { useCallback, useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import Dock from "@/components/ui/Dock";
import Sidebar from "@/components/ui/Sidebar";
import LiveKitRoom from "@/components/rtc/LiveKitRoom";
import { useColyseus } from "@/lib/hooks/useColyseus";
import { useTabVisibility } from "@/lib/hooks/useTabVisibility";

interface GameWrapperProps {
  playerName: string;
}

export default function GameWrapper({ playerName }: GameWrapperProps) {
  const { connected, error, players, sessionId, sendChat, toggleLock } =
    useColyseus(playerName);
  const [windowSize, setWindowSize] = useState({ width: 1024, height: 768 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const onHidden = useCallback(() => {
    /* Camera muting handled by LiveKitRoom */
  }, []);
  const onVisible = useCallback(() => {
    /* Camera unmuting handled by LiveKitRoom */
  }, []);

  useTabVisibility({ onHidden, onVisible });

  const handleSendChat = useCallback((message: string, channel: string) => {
    const event = new CustomEvent("send-chat-to-server", { detail: { message, channel } });
    window.dispatchEvent(event);
  }, [players]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-red-600">
            Connection Error
          </h2>
          <p className="text-sm text-red-500">{error}</p>
          <p className="mt-3 text-xs text-red-400">
            Make sure the Colyseus server is running on port 2567
          </p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-gray-500">
            Connecting to workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1838] text-gray-900 font-sans relative">
      {/* Sidebar (Left) */}
      <div className="z-10 h-full flex-shrink-0 shadow-lg">
        <Sidebar 
          players={players} 
          sessionId={sessionId} 
          onSendChat={handleSendChat} 
          localPlayerName={playerName}
        />
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1">
        <GameCanvas className="absolute inset-0" />
      </div>

      {/* Floating Video Panel (Draggable & Resizable) */}
      <Rnd
        default={{
          x: windowSize.width - 424, // 400 width + 24 margin
          y: windowSize.height - 280,
          width: 400,
          height: 250,
        }}
        minWidth={300}
        minHeight={200}
        bounds="window"
        dragHandleClassName="drag-handle"
        className="z-20"
      >
        <div className="w-full h-full rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] shadow-2xl overflow-hidden flex flex-col">
           {/* Title bar */}
           <div className="drag-handle cursor-grab active:cursor-grabbing bg-[#242424] px-4 py-2.5 flex items-center justify-between border-b border-[#2a2a2a]">
             <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 pointer-events-none">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               app.v2.gather.town
             </div>
           </div>
           {/* LiveKitRoom */}
           <div className="flex-1 p-3 overflow-hidden">
             <LiveKitRoom players={players} sessionId={sessionId} localPlayerName={playerName} />
           </div>
        </div>
      </Rnd>

      {/* Floating Bottom Dock */}
      <Dock
        playerCount={players.size + 1}
        onToggleLock={toggleLock}
      />
    </div>
  );
}
