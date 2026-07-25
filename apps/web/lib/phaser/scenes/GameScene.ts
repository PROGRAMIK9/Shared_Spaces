import Phaser from "phaser";
import { MapManager } from "../managers/MapManager";
import { PathfindingManager } from "../managers/PathfindingManager";
import { PlayerManager } from "../managers/PlayerManager";
import { gameEventBus } from "../events";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  getZoneAtTile,
  generateCollisionGrid,
  ZONES,
} from "../data/office-map";

export class GameScene extends Phaser.Scene {
  private mapManager!: MapManager;
  private pathfinding!: PathfindingManager;
  private playerManager!: PlayerManager;
  private currentZone: string = "main";
  private collisionGrid!: number[][];
  private openDoors: Set<string> = new Set();

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private moveTimer: number = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    this.collisionGrid = generateCollisionGrid();

    this.mapManager = new MapManager(this);
    this.mapManager.drawMap(this.collisionGrid);

    this.pathfinding = new PathfindingManager(this.collisionGrid);

    this.playerManager = new PlayerManager(this);

    const spawnX = 14;
    const spawnY = 10;
    this.playerManager.createLocalPlayer(spawnX, spawnY);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer);
    });

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as typeof this.wasd;
    }

    this.setupEventListeners();

    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.playerManager.getLocalContainer(), true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2);

    this.input.on("wheel", (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      let newZoom = this.cameras.main.zoom - deltaY * 0.001;
      newZoom = Phaser.Math.Clamp(newZoom, 0.8, 1.5);
      this.cameras.main.zoom = newZoom;
    });

    gameEventBus.emit("scene-ready", {});
  }

  update(time: number, delta: number): void {
    this.playerManager.update(delta);
    this.handleKeyboardMovement(time);
    this.handleDoors();
  }

  private handleDoors(): void {
    const localTile = this.playerManager.getLocalPlayerTile();
    if (!localTile) return;

    for (const zone of ZONES) {
      if (zone.doorTile.x < 0) continue;
      
      const dist = Math.abs(localTile.tileX - zone.doorTile.x) + Math.abs(localTile.tileY - zone.doorTile.y);
      const isNear = dist <= 2;
      const isOpen = this.openDoors.has(zone.id);

      if (isNear && !isOpen) {
        this.openDoors.add(zone.id);
        this.mapManager.openDoor(zone.id);
      } else if (!isNear && isOpen) {
        this.openDoors.delete(zone.id);
        this.mapManager.closeDoor(zone.id);
      }
    }
  }

  private isCalculatingPath = false;

  private handleKeyboardMovement(time: number): void {
    if (!this.cursors || !this.wasd) return;
    
    // Completely prevent jitter by ensuring we only process one movement/path at a time
    if (this.playerManager.getIsMoving() || this.isCalculatingPath) return;

    const localPos = this.playerManager.getLocalPlayerTile();
    if (!localPos) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      const targetX = localPos.tileX + dx;
      const targetY = localPos.tileY + dy;

      if (
        targetX >= 0 &&
        targetX < MAP_WIDTH &&
        targetY >= 0 &&
        targetY < MAP_HEIGHT &&
        this.collisionGrid[targetY][targetX] === 0
      ) {
        this.isCalculatingPath = true;
        this.pathfinding.findPath(
          localPos.tileX,
          localPos.tileY,
          targetX,
          targetY,
          (path) => {
            this.isCalculatingPath = false;
            if (path && path.length > 1) {
              this.playerManager.moveLocalPlayerAlongPath(path);
              gameEventBus.emit("local-player-moved", {
                x: targetX,
                y: targetY,
                tileX: targetX,
                tileY: targetY,
              });
            }
          }
        );
      }
    }
  }

  private handleClick(pointer: Phaser.Input.Pointer): void {
    const tileX = Math.floor(pointer.worldX / TILE_SIZE);
    const tileY = Math.floor(pointer.worldY / TILE_SIZE);

    if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) {
      return;
    }

    if (this.collisionGrid[tileY][tileX] === 1) {
      return;
    }

    const localPos = this.playerManager.getLocalPlayerTile();
    if (!localPos) return;

    this.pathfinding.findPath(
      localPos.tileX,
      localPos.tileY,
      tileX,
      tileY,
      (path) => {
        if (path && path.length > 1) {
          this.playerManager.moveLocalPlayerAlongPath(path);

          gameEventBus.emit("local-player-moved", {
            x: tileX,
            y: tileY,
            tileX,
            tileY,
          });
        }
      }
    );
  }

  private setupEventListeners(): void {
    gameEventBus.on(
      "remote-player-add",
      (data: unknown) => {
        const d = data as {
          sessionId: string;
          name: string;
          x: number;
          y: number;
        };
        this.playerManager.addRemotePlayer(d.sessionId, d.name, d.x, d.y);
      }
    );

    gameEventBus.on(
      "remote-player-update",
      (data: unknown) => {
        const d = data as {
          sessionId: string;
          x: number;
          y: number;
          direction: string;
          animation: string;
          name: string;
        };
        this.playerManager.updateRemotePlayer(
          d.sessionId,
          d.x,
          d.y,
          d.direction,
          d.animation
        );
      }
    );

    gameEventBus.on(
      "remote-player-remove",
      (data: unknown) => {
        const d = data as { sessionId: string };
        this.playerManager.removeRemotePlayer(d.sessionId);
      }
    );

    gameEventBus.on(
      "set-target-fps",
      (data: unknown) => {
        const d = data as { fps: number };
        this.game.loop.targetFps = d.fps;
      }
    );

    gameEventBus.on(
      "position-rollback",
      (data: unknown) => {
        const d = data as { x: number; y: number };
        this.playerManager.rollbackLocalPlayer(d.x, d.y);
      }
    );
  }

  checkZoneTransition(tileX: number, tileY: number): void {
    const newZone = getZoneAtTile(tileX, tileY) ?? "main";

    if (newZone !== this.currentZone) {
      if (this.currentZone !== "main") {
        gameEventBus.emit("zone-exited", {});
      }
      this.currentZone = newZone;
      if (newZone !== "main") {
        gameEventBus.emit("zone-entered", { zoneId: newZone });
      }
    }
  }
}
