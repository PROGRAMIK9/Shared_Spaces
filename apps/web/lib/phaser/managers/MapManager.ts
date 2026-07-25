import Phaser from "phaser";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  ZONES,
  FURNITURE,
  COLORS,
  getFurnitureAt,
  getZoneAtTile,
} from "../data/office-map";

export class MapManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  drawMap(collisionGrid: number[][]): void {
    this.drawFloor(collisionGrid);
    this.drawZoneHighlights();
    this.drawWalls(collisionGrid);
    this.drawFurniture();
    this.drawGridLines();
    this.drawZoneLabels();
    this.drawDoorGlows();
  }

  private drawFloor(_collisionGrid: number[][]): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(0);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const isAlt = (x + y) % 2 === 0;
        const zone = getZoneAtTile(x, y);

        if (zone) {
          const zoneDef = ZONES.find((z) => z.id === zone);
          if (zoneDef) {
            const baseColor = zoneDef.color;
            const r = ((baseColor >> 16) & 0xff) * (isAlt ? 0.3 : 0.25);
            const g = ((baseColor >> 8) & 0xff) * (isAlt ? 0.3 : 0.25);
            const b = (baseColor & 0xff) * (isAlt ? 0.3 : 0.25);
            const dimmed =
              (Math.floor(r) << 16) |
              (Math.floor(g) << 8) |
              Math.floor(b);
            gfx.fillStyle(dimmed, 1);
          }
        } else {
          // Add subtle checkerboard to main floor
          const r = isAlt ? 248 : 241;
          const g = isAlt ? 250 : 245;
          const b = isAlt ? 252 : 249;
          gfx.fillStyle((r << 16) | (g << 8) | b, 1);
        }

        gfx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Add subtle dot pattern to all floors
        gfx.fillStyle(0x000000, 0.03);
        gfx.fillCircle(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 2);
      }
    }
  }

  private drawZoneHighlights(): void {
    for (const zone of ZONES) {
      const b = zone.bounds;
      const gfx = this.scene.add.graphics();
      gfx.setDepth(1);

      gfx.lineStyle(2, zone.color, 0.4);
      gfx.strokeRoundedRect(
        b.x1 * TILE_SIZE + 2,
        b.y1 * TILE_SIZE + 2,
        (b.x2 - b.x1 + 1) * TILE_SIZE - 4,
        (b.y2 - b.y1 + 1) * TILE_SIZE - 4,
        6
      );

      gfx.fillStyle(zone.color, 0.06);
      gfx.fillRoundedRect(
        b.x1 * TILE_SIZE + 2,
        b.y1 * TILE_SIZE + 2,
        (b.x2 - b.x1 + 1) * TILE_SIZE - 4,
        (b.y2 - b.y1 + 1) * TILE_SIZE - 4,
        6
      );
    }
  }

  private drawWalls(collisionGrid: number[][]): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(2);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (collisionGrid[y][x] !== 1) continue;

        const furniture = getFurnitureAt(x, y);
        if (furniture) continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        gfx.fillStyle(COLORS.WALL, 1);
        gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        const hasFloorBelow =
          y + 1 < MAP_HEIGHT && collisionGrid[y + 1][x] === 0;
          
        // Draw the main wall body
        gfx.fillStyle(COLORS.WALL, 1);
        gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        
        // Give walls a top edge highlight
        gfx.fillStyle(0xffffff, 0.6);
        gfx.fillRect(px, py, TILE_SIZE, 3);
        
        if (hasFloorBelow) {
          gfx.fillStyle(COLORS.WALL_FACE, 1);
          // Make the face pop more
          gfx.fillRect(px, py + TILE_SIZE - 12, TILE_SIZE, 12);
          
          // Add a shadow cast on the floor below
          gfx.fillStyle(0x000000, 0.15);
          gfx.fillRect(px, py + TILE_SIZE, TILE_SIZE, 6);
        }

        gfx.lineStyle(1, 0x1a1838, 0.3);
        gfx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  private drawFurniture(): void {
    for (const f of FURNITURE) {
      const w = f.width ?? 1;
      const h = f.height ?? 1;
      const px = f.x * TILE_SIZE;
      const py = f.y * TILE_SIZE;
      const pw = w * TILE_SIZE;
      const ph = h * TILE_SIZE;

      const gfx = this.scene.add.graphics();
      gfx.setDepth(3);

      switch (f.type) {
        case "table": {
          gfx.fillStyle(0x000000, 0.2);
          gfx.fillRoundedRect(px + 4, py + 6, pw - 8, ph - 4, 4);
          gfx.fillStyle(f.color, 1);
          gfx.fillRoundedRect(px + 4, py + 4, pw - 8, ph - 6, 4);
          gfx.lineStyle(1, 0xffffff, 0.1);
          gfx.strokeRoundedRect(px + 4, py + 4, pw - 8, ph - 6, 4);
          break;
        }
        case "desk": {
          gfx.fillStyle(0x000000, 0.2);
          gfx.fillRoundedRect(px + 4, py + 6, pw - 8, ph - 6, 3);
          gfx.fillStyle(f.color, 1);
          gfx.fillRoundedRect(px + 4, py + 4, pw - 8, ph - 6, 3);
          // Monitor on desk
          gfx.fillStyle(0x334155, 1);
          gfx.fillRoundedRect(px + 8, py + 6, pw - 16, ph - 16, 2);
          gfx.fillStyle(0x60a5fa, 0.3);
          gfx.fillRoundedRect(px + 9, py + 7, pw - 18, ph - 18, 1);
          break;
        }
        case "couch": {
          gfx.fillStyle(0x000000, 0.15);
          gfx.fillRoundedRect(px + 2, py + 5, pw - 4, ph - 4, 6);
          gfx.fillStyle(f.color, 1);
          gfx.fillRoundedRect(px + 2, py + 2, pw - 4, ph - 4, 6);
          gfx.fillStyle(Phaser.Display.Color.IntegerToColor(f.color).brighten(20).color, 1);
          gfx.fillRoundedRect(px + 6, py + 6, pw - 12, ph - 10, 3);
          break;
        }
        case "table_round": {
          gfx.fillStyle(0x000000, 0.2);
          gfx.fillCircle(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2 + 2,
            TILE_SIZE / 3
          );
          gfx.fillStyle(f.color, 1);
          gfx.fillCircle(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2,
            TILE_SIZE / 3
          );
          gfx.lineStyle(1, 0xffffff, 0.1);
          gfx.strokeCircle(
            px + TILE_SIZE / 2,
            py + TILE_SIZE / 2,
            TILE_SIZE / 3
          );
          break;
        }
        case "plant": {
          gfx.fillStyle(0x3f3f2e, 1);
          gfx.fillRoundedRect(
            px + TILE_SIZE / 2 - 5,
            py + TILE_SIZE / 2 + 2,
            10,
            12,
            2
          );
          gfx.fillStyle(f.color, 1);
          gfx.fillCircle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 - 2, 9);
          gfx.fillStyle(
            Phaser.Display.Color.IntegerToColor(f.color).brighten(30).color,
            1
          );
          gfx.fillCircle(px + TILE_SIZE / 2 - 3, py + TILE_SIZE / 2 - 5, 5);
          break;
        }
        case "bookshelf": {
          gfx.fillStyle(f.color, 1);
          gfx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
          // Books
          const bookColors = [0xe11d48, 0x2563eb, 0x16a34a, 0xd97706];
          for (let i = 0; i < 4; i++) {
            gfx.fillStyle(bookColors[i], 1);
            gfx.fillRect(px + 4 + i * 6, py + 4, 5, ph - 10);
          }
          break;
        }
      }
    }
  }

  private drawGridLines(): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(1);
    gfx.lineStyle(1, COLORS.GRID_LINE, 0.15);

    for (let x = 0; x <= MAP_WIDTH; x++) {
      gfx.moveTo(x * TILE_SIZE, 0);
      gfx.lineTo(x * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    }
    for (let y = 0; y <= MAP_HEIGHT; y++) {
      gfx.moveTo(0, y * TILE_SIZE);
      gfx.lineTo(MAP_WIDTH * TILE_SIZE, y * TILE_SIZE);
    }
    gfx.strokePath();
  }

  private drawZoneLabels(): void {
    for (const zone of ZONES) {
      const b = zone.bounds;
      const centerX = ((b.x1 + b.x2 + 1) / 2) * TILE_SIZE;
      const topY = b.y1 * TILE_SIZE + 8;

      const label = this.scene.add
        .text(centerX, topY, zone.label, {
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: Phaser.Display.Color.IntegerToColor(zone.labelColor).rgba,
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0)
        .setDepth(5)
        .setAlpha(0.7);

      this.scene.tweens.add({
        targets: label,
        alpha: { from: 0.5, to: 0.8 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private drawDoorGlows(): void {
    for (const zone of ZONES) {
      if (zone.doorTile.x < 0) continue;

      const px = zone.doorTile.x * TILE_SIZE + TILE_SIZE / 2;
      const py = zone.doorTile.y * TILE_SIZE + TILE_SIZE / 2;

      const glow = this.scene.add.graphics();
      glow.setDepth(2);
      glow.fillStyle(COLORS.DOOR_GLOW, 0.15);
      glow.fillCircle(px, py, TILE_SIZE / 2);

      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.4, to: 1 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }
}
