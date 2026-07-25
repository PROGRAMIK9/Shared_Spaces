"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Room } from "colyseus.js";
import { joinWorkspaceRoom } from "@/lib/colyseus/client";
import { gameEventBus } from "@/lib/phaser/events";

interface ColyseusState {
  room: Room | null;
  sessionId: string | null;
  connected: boolean;
  error: string | null;
  players: Map<
    string,
    {
      name: string;
      x: number;
      y: number;
      direction: string;
      animation: string;
      currentZone: string;
      isTabShifted: boolean;
    }
  >;
}

export function useColyseus(playerName: string): ColyseusState & {
  sendChat: (message: string) => void;
  toggleLock: (zoneId: string) => void;
} {
  const [state, setState] = useState<ColyseusState>({
    room: null,
    sessionId: null,
    connected: false,
    error: null,
    players: new Map(),
  });

  const roomRef = useRef<Room | null>(null);
  const mountedRef = useRef(true);

  const sendChat = useCallback((message: string) => {
    roomRef.current?.send("chat", { message });
  }, []);

  const toggleLock = useCallback((zoneId: string) => {
    roomRef.current?.send("toggle_lock", { zoneId });
  }, []);

  useEffect(() => {
    const handleChatSend = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; channel: string }>;
      roomRef.current?.send("chat", { message: customEvent.detail.message, channel: customEvent.detail.channel });
    };
    window.addEventListener("send-chat-to-server", handleChatSend);
    return () => window.removeEventListener("send-chat-to-server", handleChatSend);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let room: Room | null = null;

    async function connect() {
      try {
        room = await joinWorkspaceRoom({ name: playerName });
        roomRef.current = room;

        if (!mountedRef.current) {
          room.leave();
          return;
        }

        setState((prev) => ({
          ...prev,
          room,
          sessionId: room!.sessionId,
          connected: true,
          error: null,
        }));

        room.state.players.onAdd((player: Record<string, unknown>, sessionId: string) => {
          if (sessionId === room!.sessionId) return;

          gameEventBus.emit("remote-player-add", {
            sessionId,
            name: player.name as string,
            x: player.x as number,
            y: player.y as number,
          });

          setState((prev) => {
            const next = new Map(prev.players);
            next.set(sessionId, {
              name: player.name as string,
              x: player.x as number,
              y: player.y as number,
              direction: player.direction as string,
              animation: player.animation as string,
              currentZone: player.currentZone as string,
              isTabShifted: player.isTabShifted as boolean,
            });
            return { ...prev, players: next };
          });

          (player as { onChange?: (callback: () => void) => void }).onChange?.(() => {
            if (sessionId === room!.sessionId) return;

            gameEventBus.emit("remote-player-update", {
              sessionId,
              x: player.x as number,
              y: player.y as number,
              direction: player.direction as string,
              animation: player.animation as string,
              name: player.name as string,
            });

            setState((prev) => {
              const next = new Map(prev.players);
              next.set(sessionId, {
                name: player.name as string,
                x: player.x as number,
                y: player.y as number,
                direction: player.direction as string,
                animation: player.animation as string,
                currentZone: player.currentZone as string,
                isTabShifted: player.isTabShifted as boolean,
              });
              return { ...prev, players: next };
            });
          });
        });

        room.state.players.onRemove((_player: unknown, sessionId: string) => {
          gameEventBus.emit("remote-player-remove", { sessionId });
          setState((prev) => {
            const next = new Map(prev.players);
            next.delete(sessionId);
            return { ...prev, players: next };
          });
        });

        room.onMessage("position_rollback", (data: { x: number; y: number }) => {
          gameEventBus.emit("position-rollback", data);
        });

        room.onMessage("chat_message", (data: any) => {
          window.dispatchEvent(
            new CustomEvent("colyseus-chat", { detail: data })
          );
        });

        // Bridge local Phaser movement → Colyseus server
        const positionHandler = (data: unknown) => {
          const d = data as {
            x: number;
            y: number;
            direction: string;
            animation: string;
          };
          room?.send("position", d);
        };
        gameEventBus.on("local-position-sync", positionHandler);

        const moveHandler = (data: unknown) => {
          const d = data as { tileX: number; tileY: number };
          room?.send("move", { targetX: d.tileX, targetY: d.tileY });
        };
        gameEventBus.on("local-player-moved", moveHandler);

        // Tab visibility → Colyseus
        const visHandler = (data: unknown) => {
          const d = data as { isHidden: boolean };
          room?.send("tab_visibility", d);
        };
        gameEventBus.on("tab-visibility-changed", visHandler);

      } catch (err) {
        console.error("[useColyseus] Connection failed:", err);
        if (mountedRef.current) {
          setState((prev) => ({
            ...prev,
            error: err instanceof Error ? err.message : "Connection failed",
          }));
        }
      }
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (room) {
        room.leave();
      }
      gameEventBus.removeAllListeners("local-position-sync");
      gameEventBus.removeAllListeners("local-player-moved");
      gameEventBus.removeAllListeners("tab-visibility-changed");
    };
  }, [playerName]);

  return { ...state, sendChat, toggleLock };
}
