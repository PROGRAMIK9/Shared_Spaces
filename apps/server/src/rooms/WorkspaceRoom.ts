import { Room, Client } from "colyseus";
import { WorkspaceState } from "../schemas/RoomState";
import { PlayerState } from "../schemas/PlayerState";
import { ZoneState } from "../schemas/ZoneState";

const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;

interface ZoneBounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const ZONE_BOUNDS: Record<string, ZoneBounds> = {
  room_a: { x1: 1, y1: 1, x2: 5, y2: 5 },
  room_b: { x1: 24, y1: 1, x2: 28, y2: 5 },
  room_c: { x1: 1, y1: 14, x2: 5, y2: 18 },
  room_d: { x1: 24, y1: 14, x2: 28, y2: 18 },
  lounge: { x1: 11, y1: 8, x2: 18, y2: 12 },
};

function getZoneAtPosition(tileX: number, tileY: number): string | null {
  for (const [zoneId, bounds] of Object.entries(ZONE_BOUNDS)) {
    if (
      tileX >= bounds.x1 &&
      tileX <= bounds.x2 &&
      tileY >= bounds.y1 &&
      tileY <= bounds.y2
    ) {
      return zoneId;
    }
  }
  return null;
}

export class WorkspaceRoom extends Room<WorkspaceState> {
  maxClients = 50;

  onCreate(_options: Record<string, unknown>): void {
    this.setState(new WorkspaceState());

    for (const zoneId of Object.keys(ZONE_BOUNDS)) {
      const zone = new ZoneState();
      zone.zoneId = zoneId;
      zone.isLocked = false;
      zone.ownerId = "";
      this.state.zones.set(zoneId, zone);
    }

    this.onMessage("move", (client, data: { targetX: number; targetY: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const { targetX, targetY } = data;
      if (targetX < 0 || targetX >= MAP_WIDTH || targetY < 0 || targetY >= MAP_HEIGHT) return;

      const targetZone = getZoneAtPosition(targetX, targetY);
      if (targetZone) {
        const zone = this.state.zones.get(targetZone);
        if (zone && zone.isLocked && zone.ownerId !== client.sessionId) {
          client.send("position_rollback", { x: player.x, y: player.y });
          return;
        }
      }

      player.targetX = targetX;
      player.targetY = targetY;
    });

    this.onMessage(
      "position",
      (client, data: { x: number; y: number; direction: string; animation: string }) => {
        const player = this.state.players.get(client.sessionId);
        if (!player) return;
        player.x = data.x;
        player.y = data.y;
        player.direction = data.direction;
        player.animation = data.animation;

        const newZone = getZoneAtPosition(
          Math.round(data.x),
          Math.round(data.y)
        );
        const zoneId = newZone ?? "main";

        if (player.currentZone !== zoneId) {
          const oldZone = player.currentZone;
          if (zoneId !== "main") {
            const zone = this.state.zones.get(zoneId);
            if (zone && zone.isLocked && zone.ownerId !== client.sessionId) {
              client.send("position_rollback", { x: player.x, y: player.y });
              return;
            }
          }
          player.currentZone = zoneId;
          this.broadcast("player_zone_changed", {
            sessionId: client.sessionId,
            zoneId,
            previousZone: oldZone,
          });
        }
      }
    );

    this.onMessage("join_zone", (client, data: { zoneId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const zone = this.state.zones.get(data.zoneId);
      if (!zone) return;

      if (zone.isLocked && zone.ownerId !== client.sessionId) {
        client.send("zone_rejected", { zoneId: data.zoneId, reason: "locked" });
        client.send("position_rollback", { x: player.x, y: player.y });
        return;
      }

      player.currentZone = data.zoneId;
      this.broadcast("player_zone_changed", {
        sessionId: client.sessionId,
        zoneId: data.zoneId,
      });
    });

    this.onMessage("leave_zone", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.currentZone = "main";
      this.broadcast("player_zone_changed", {
        sessionId: client.sessionId,
        zoneId: "main",
      });
    });

    this.onMessage("toggle_lock", (client, data: { zoneId: string }) => {
      const zone = this.state.zones.get(data.zoneId);
      if (!zone) return;
      if (data.zoneId === "lounge" || data.zoneId === "main") return; // Cannot lock public areas

      if (zone.ownerId === "" || zone.ownerId === client.sessionId) {
        zone.isLocked = !zone.isLocked;
        zone.ownerId = zone.isLocked ? client.sessionId : "";
        this.broadcast("zone_lock_changed", {
          zoneId: data.zoneId,
          isLocked: zone.isLocked,
          ownerId: zone.ownerId,
        });
      }
    });

    this.onMessage("tab_visibility", (client, data: { isHidden: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.isTabShifted = data.isHidden;
    });

    this.onMessage("chat", (client, data: { message: string; channel: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      this.broadcast("chat_message", {
        sessionId: client.sessionId,
        name: player.name,
        message: data.message,
        channel: data.channel || "general",
        timestamp: Date.now(),
      });
    });
  }

  onJoin(client: Client, options: { name?: string; avatarUrl?: string }): void {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.name = options.name || `User_${client.sessionId.substring(0, 4)}`;
    player.avatarUrl = options.avatarUrl || "";

    const spawnX = 12 + Math.floor(Math.random() * 6);
    const spawnY = 8 + Math.floor(Math.random() * 4);
    player.x = spawnX;
    player.y = spawnY;
    player.targetX = spawnX;
    player.targetY = spawnY;

    this.state.players.set(client.sessionId, player);
    console.log(`[WorkspaceRoom] ${player.name} (${client.sessionId}) joined.`);
  }

  onLeave(client: Client): void {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      console.log(`[WorkspaceRoom] ${player.name} (${client.sessionId}) left.`);
      this.state.zones.forEach((zone) => {
        if (zone.ownerId === client.sessionId) {
          zone.isLocked = false;
          zone.ownerId = "";
        }
      });
    }
    this.state.players.delete(client.sessionId);
  }

  onDispose(): void {
    console.log("[WorkspaceRoom] Room disposed.");
  }
}
