"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { TILE_SIZE } from "@/lib/phaser/data/office-map";
import { getEffectiveVolume } from "@/lib/livekit/spatial-audio";

interface PlayerInfo {
  name: string;
  x: number;
  y: number;
  direction: string;
  animation: string;
  currentZone: string;
  isTabShifted: boolean;
}

interface LiveKitRoomProps {
  players: Map<string, PlayerInfo>;
  sessionId: string | null;
  localPlayerName?: string;
}

export default function LiveKitRoom({ players, sessionId, localPlayerName = "You" }: LiveKitRoomProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleCameraToggle = (e: Event) => {
      const customEvent = e as CustomEvent<MediaStream | null>;
      setLocalStream(customEvent.detail);
    };
    window.addEventListener("local-camera-toggled", handleCameraToggle);
    return () => window.removeEventListener("local-camera-toggled", handleCameraToggle);
  }, []);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const updateSpatialAudio = useCallback(() => {
    if (!sessionId) return;
    const localPosEl = document.getElementById("local-player-pos");
    if (!localPosEl) return;
    const localX = parseFloat(localPosEl.dataset.x ?? "0") * TILE_SIZE;
    const localY = parseFloat(localPosEl.dataset.y ?? "0") * TILE_SIZE;
    const localZone = localPosEl.dataset.zone ?? "main";

    const volumes: Record<string, { volume: number; pan: number }> = {};
    players.forEach((player, sid) => {
      const remoteX = player.x * TILE_SIZE;
      const remoteY = player.y * TILE_SIZE;
      const result = getEffectiveVolume(
        localX,
        localY,
        localZone,
        remoteX,
        remoteY,
        player.currentZone
      );
      volumes[sid] = result;
    });

    window.dispatchEvent(
      new CustomEvent("spatial-audio-update", { detail: volumes })
    );
  }, [players, sessionId]);

  useEffect(() => {
    intervalRef.current = setInterval(updateSpatialAudio, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [updateSpatialAudio]);

  return (
    <>
      <div id="local-player-pos" className="hidden" data-x="14" data-y="10" data-zone="main" />

      {/* Local Video Tile */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
        {localStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-500">
              {localPlayerName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
          <p className="truncate text-xs font-medium text-white">
            {localPlayerName} (You)
          </p>
        </div>
      </div>

      {/* Remote Video Tiles */}
      {Array.from(players.entries())
        .filter(([, p]) => !p.isTabShifted)
        .map(([sid, player]) => (
          <div
            key={sid}
            className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm"
          >
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-600">
                {player.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
              <p className="truncate text-xs font-medium text-white">
                {player.name}
              </p>
            </div>
          </div>
        ))}
    </>
  );
}
