"use client";

import { useCallback } from "react";
import GameCanvas from "./GameCanvas";
import Dock from "@/components/ui/Dock";
import Sidebar from "@/components/ui/Sidebar";
import { useColyseus } from "@/lib/hooks/useColyseus";
import { useTabVisibility } from "@/lib/hooks/useTabVisibility";

interface GameWrapperProps {
  playerName: string;
}

export default function GameWrapper({ playerName }: GameWrapperProps) {
  const { connected, error, players, sessionId, sendChat, toggleLock } =
    useColyseus(playerName);

  const onHidden = useCallback(() => {
    /* Camera muting handled by LiveKitRoom */
  }, []);
  const onVisible = useCallback(() => {
    /* Camera unmuting handled by LiveKitRoom */
  }, []);

  useTabVisibility({ onHidden, onVisible });

  const handleSendChat = useCallback((message: string, channel: string) => {
    // Send chat with channel info (we assume useColyseus passes it through or we modify useColyseus)
    // To keep it simple, we can just use sendChat directly but we need to update useColyseus to accept channel
    const colyseusClient = players.size > 0 ? true : false;
    // Actually we can dispatch a custom event or update useColyseus.
    // Let's just dispatch the custom event for now since we modified WorkspaceRoom to expect { message, channel }
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
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900">
      {/* Main Game Area (75%) */}
      <div className="relative flex-1">
        {/* Phaser Canvas */}
        <GameCanvas className="absolute inset-0" />

        {/* Bottom Dock */}
        <Dock
          playerCount={players.size + 1}
          onToggleLock={toggleLock}
        />
      </div>

      {/* Sidebar (25%) */}
      <div className="w-96 flex-shrink-0 border-l border-gray-200 bg-white">
        <Sidebar 
          players={players} 
          sessionId={sessionId} 
          onSendChat={handleSendChat} 
          localPlayerName={playerName}
        />
      </div>
    </div>
  );
}
