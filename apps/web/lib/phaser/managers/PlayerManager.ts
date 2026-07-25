import Phaser from "phaser";
import { TILE_SIZE, getFurnitureAt } from "../data/office-map";
import { gameEventBus } from "../events";
import type { PathPoint } from "./PathfindingManager";
import type { GameScene } from "../scenes/GameScene";

interface RemotePlayerSprite {
  container: Phaser.GameObjects.Container;
  avatar: Phaser.GameObjects.Graphics;
  nameTag: Phaser.GameObjects.Text;
  shadow: Phaser.GameObjects.Image;
  targetX: number;
  targetY: number;
}

const MOVE_SPEED = 480; // pixels per second
const LERP_FACTOR = 0.35;

export class PlayerManager {
  private scene: GameScene;
  private localContainer!: Phaser.GameObjects.Container;
  private localAvatar!: Phaser.GameObjects.Graphics;
  private localShadow!: Phaser.GameObjects.Image;
  private localNameTag!: Phaser.GameObjects.Text;

  private remotePlayers: Map<string, RemotePlayerSprite> = new Map();

  private path: PathPoint[] = [];
  private pathIndex = 0;
  private isMoving = false;
  private localTileX = 0;
  private localTileY = 0;
  private direction = "down";

  constructor(scene: GameScene) {
    this.scene = scene;
  }

  private getColorForName(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x14b8a6];
    return colors[Math.abs(hash) % colors.length];
  }

  private createAvatarGraphics(colorHex: number, isLocal: boolean): Phaser.GameObjects.Graphics {
    const g = this.scene.add.graphics();
    // Draw shoulders (rotated to face down initially)
    g.fillStyle(colorHex, 1);
    g.fillRoundedRect(-24, -14, 48, 28, 14);
    g.lineStyle(2, 0x000000, 0.4);
    g.strokeRoundedRect(-24, -14, 48, 28, 14);
    // Draw head
    g.fillStyle(0xffdbac, 1); // skin color
    g.fillCircle(0, 0, 16);
    g.lineStyle(2, 0x000000, 0.4);
    g.strokeCircle(0, 0, 16);
    
    // Draw an indicator of direction (nose/visor)
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(-8, 12, 16, 12, 4);

    if (isLocal) {
      g.lineStyle(2, 0xffffff, 0.8);
      g.strokeCircle(0, 0, 22);
    }
    return g;
  }

  createLocalPlayer(tileX: number, tileY: number): void {
    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.localShadow = this.scene.add
      .image(0, 18, "shadow")
      .setAlpha(0.5)
      .setScale(1.5);

    const color = this.getColorForName("You");
    this.localAvatar = this.createAvatarGraphics(color, true);

    this.localNameTag = this.scene.add
      .text(0, 20, "You", {
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "10px",
        color: "#ffffff",
        backgroundColor: "rgba(30, 30, 30, 0.85)",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5);

    this.localContainer = this.scene.add.container(px, py, [
      this.localShadow,
      this.localAvatar,
      this.localNameTag,
    ]);
    this.localContainer.setDepth(10);

    this.localTileX = tileX;
    this.localTileY = tileY;

    this.scene.tweens.add({
      targets: this.localAvatar,
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 400,
      ease: "Back.easeOut",
    });
  }

  moveLocalPlayerAlongPath(pathPoints: PathPoint[]): void {
    this.path = pathPoints;
    this.pathIndex = 1;
    this.isMoving = true;
  }

  rollbackLocalPlayer(tileX: number, tileY: number): void {
    this.path = [];
    this.pathIndex = 0;
    this.isMoving = false;

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.scene.tweens.add({
      targets: this.localContainer,
      x: px,
      y: py,
      duration: 200,
      ease: "Quad.easeOut",
    });

    this.localTileX = tileX;
    this.localTileY = tileY;
  }

  update(delta: number): void {
    this.updateLocalPlayer(delta);
    this.updateRemotePlayers();
  }

  private updateLocalPlayer(delta: number): void {
    if (!this.isMoving || this.pathIndex >= this.path.length) {
      this.isMoving = false;
      return;
    }

    const target = this.path[this.pathIndex];
    const targetPx = target.x * TILE_SIZE + TILE_SIZE / 2;
    const targetPy = target.y * TILE_SIZE + TILE_SIZE / 2;

    const dx = targetPx - this.localContainer.x;
    const dy = targetPy - this.localContainer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const step = (MOVE_SPEED * delta) / 1000;
    
    if (dist <= step) {
      this.localContainer.x = targetPx;
      this.localContainer.y = targetPy;
      this.localTileX = target.x;
      this.localTileY = target.y;
      this.pathIndex++;

      this.scene.checkZoneTransition(target.x, target.y);

      let isSitting = false;
      if (this.pathIndex >= this.path.length) {
        this.isMoving = false;
        
        const furn = getFurnitureAt(target.x, target.y);
        if (furn && (furn.type === "couch" || furn.type === "desk")) {
          isSitting = true;
          this.localAvatar.y = 8;
        } else {
          this.addIdleBob();
        }
      }

      gameEventBus.emit("local-position-sync", {
        x: target.x,
        y: target.y,
        direction: this.direction,
        animation: this.isMoving ? "walk" : (isSitting ? "sit" : "idle"),
      });

      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;

    this.localContainer.x += nx * step;
    this.localContainer.y += ny * step;

    this.updateDirection(nx, ny);
    this.animateWalking();
  }

  private updateDirection(nx: number, ny: number): void {
    const angle = Math.atan2(ny, nx) * (180 / Math.PI);
    let newDir = this.direction;

    if (angle > -45 && angle <= 45) newDir = "right";
    else if (angle > 45 && angle <= 135) newDir = "down";
    else if (angle > 135 || angle <= -135) newDir = "left";
    else newDir = "up";

    if (newDir !== this.direction) {
      this.direction = newDir;
      const rotations: Record<string, number> = {
        up: -180,
        right: -90,
        down: 0,
        left: 90,
      };
      // Smoothly tween avatar rotation
      this.scene.tweens.add({
        targets: this.localAvatar,
        angle: rotations[this.direction],
        duration: 200,
        ease: "Sine.easeInOut",
      });
    }
  }

  private animateWalking(): void {
    const bobAmount = Math.sin(Date.now() / 100) * 1.5;
    this.localAvatar.y = bobAmount;
    this.localShadow.setScale(0.9 + Math.sin(Date.now() / 100) * 0.05);
  }

  private addIdleBob(): void {
    this.scene.tweens.add({
      targets: this.localAvatar,
      y: { from: 0, to: -2 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  addRemotePlayer(
    sessionId: string,
    name: string,
    tileX: number,
    tileY: number
  ): void {
    if (this.remotePlayers.has(sessionId)) return;

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    const shadow = this.scene.add
      .image(0, 18, "shadow")
      .setAlpha(0.4)
      .setScale(1.5);
      
    const color = this.getColorForName(name);
    const avatar = this.createAvatarGraphics(color, false);
    const nameTag = this.scene.add
      .text(0, 20, name, {
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "10px",
        color: "#ffffff",
        backgroundColor: "rgba(30, 30, 30, 0.85)",
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5);

    const container = this.scene.add.container(px, py, [
      shadow,
      avatar,
      nameTag,
    ]);
    container.setDepth(9);

    this.scene.tweens.add({
      targets: avatar,
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 400,
      ease: "Back.easeOut",
    });

    this.remotePlayers.set(sessionId, {
      container,
      avatar,
      nameTag,
      shadow,
      targetX: px,
      targetY: py,
    });
  }

  updateRemotePlayer(
    sessionId: string,
    tileX: number,
    tileY: number,
    direction: string,
    _animation: string
  ): void {
    const remote = this.remotePlayers.get(sessionId);
    if (!remote) return;

    remote.targetX = tileX * TILE_SIZE + TILE_SIZE / 2;
    remote.targetY = tileY * TILE_SIZE + TILE_SIZE / 2;

    const rotations: Record<string, number> = {
      up: -180,
      right: -90,
      down: 0,
      left: 90,
    };
    const targetAngle = rotations[direction] ?? 0;
    this.scene.tweens.add({
      targets: remote.avatar,
      angle: targetAngle,
      duration: 200,
      ease: "Sine.easeInOut",
    });
  }

  removeRemotePlayer(sessionId: string): void {
    const remote = this.remotePlayers.get(sessionId);
    if (!remote) return;

    this.scene.tweens.add({
      targets: remote.avatar,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: "Back.easeIn",
      onComplete: () => {
        remote.container.destroy();
      },
    });

    this.remotePlayers.delete(sessionId);
  }

  private updateRemotePlayers(): void {
    this.remotePlayers.forEach((remote) => {
      const dx = remote.targetX - remote.container.x;
      const dy = remote.targetY - remote.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        remote.container.x += dx * LERP_FACTOR;
        remote.container.y += dy * LERP_FACTOR;

        const bobAmount = Math.sin(Date.now() / 120) * 1.2;
        remote.avatar.y = bobAmount;
      } else {
        // Stop moving, check if sitting based on furniture (simplified for remote, ideally server sends animation state, which we have!)
        // Wait, remote-player-update sets animation, but we didn't store it in RemotePlayerSprite!
        // We can just rely on getFurnitureAt for remote players too if they are standing still
        const tileX = Math.floor(remote.container.x / TILE_SIZE);
        const tileY = Math.floor(remote.container.y / TILE_SIZE);
        const furn = getFurnitureAt(tileX, tileY);
        if (furn && (furn.type === "couch" || furn.type === "desk")) {
          remote.avatar.y = 8;
        } else {
          remote.avatar.y = Math.sin(Date.now() / 150) * 0.5; // slight idle bob
        }
      }
    });
  }

  getLocalPlayerTile(): { tileX: number; tileY: number } | null {
    return { tileX: this.localTileX, tileY: this.localTileY };
  }

  getLocalPlayerPixelPos(): { x: number; y: number } | null {
    if (!this.localContainer) return null;
    return { x: this.localContainer.x, y: this.localContainer.y };
  }

  getIsMoving(): boolean {
    return this.isMoving;
  }

  getLocalContainer(): Phaser.GameObjects.Container {
    return this.localContainer;
  }

  getRemotePlayerPixelPos(
    sessionId: string
  ): { x: number; y: number } | null {
    const remote = this.remotePlayers.get(sessionId);
    if (!remote) return null;
    return { x: remote.container.x, y: remote.container.y };
  }
}
