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
  private doorGraphics: Map<string, Phaser.GameObjects.Graphics> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  drawMap(collisionGrid: number[][]): void {
    this.drawFloor();
    this.drawWalls(collisionGrid);
    this.drawFurniture();
    this.drawDoors();
    this.drawZoneLabels();
  }

  private drawFloor(): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(0);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const zone = getZoneAtTile(x, y);

        // White base floor
        let color = COLORS.FLOOR_A; 

        if (zone) {
          const zoneDef = ZONES.find((z) => z.id === zone);
          if (zoneDef) {
            color = zoneDef.color;
          }
        }

        gfx.fillStyle(color, 1);
        gfx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Very light grey grid lines
        gfx.lineStyle(1, COLORS.GRID_LINE, 1);
        gfx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  private drawWalls(collisionGrid: number[][]): void {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(2);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (collisionGrid[y][x] !== 1) continue;
        
        let isDoor = false;
        for (const z of ZONES) {
          if (z.doorTile.x === x && z.doorTile.y === y) {
            isDoor = true;
            break;
          }
        }
        if (isDoor) continue;

        const furniture = getFurnitureAt(x, y);
        if (furniture) continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        const hasFloorBelow =
          y + 1 < MAP_HEIGHT && collisionGrid[y + 1][x] === 0;
          
        gfx.fillStyle(COLORS.WALL, 1); 
        gfx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        
        gfx.fillStyle(0x78716c, 1); // Darker top edge
        gfx.fillRect(px, py, TILE_SIZE, 4);
        
        // Simulating glass walls (like the screenshot) for walls that have floor above them
        const hasFloorAbove = y - 1 >= 0 && collisionGrid[y - 1][x] === 0;
        if (hasFloorBelow && hasFloorAbove) {
           gfx.fillStyle(0x38bdf8, 0.4); // light blue glass
           gfx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 16);
           gfx.lineStyle(2, 0x0284c7, 0.8);
           gfx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 16);
        }
        
        if (hasFloorBelow) {
          gfx.fillStyle(COLORS.WALL_FACE, 1); 
          gfx.fillRect(px, py + TILE_SIZE - 12, TILE_SIZE, 12);
          
          gfx.fillStyle(0x000000, 0.2);
          gfx.fillRect(px, py + TILE_SIZE, TILE_SIZE, 8);
        }
      }
    }
  }

  private drawDoors(): void {
    for (const zone of ZONES) {
      if (zone.doorTile.x < 0) continue;

      const px = zone.doorTile.x * TILE_SIZE;
      const py = zone.doorTile.y * TILE_SIZE;

      const door = this.scene.add.graphics();
      door.setDepth(2.1);
      
      door.fillStyle(0x8b5cf6, 1); // Purple door
      door.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      door.lineStyle(2, 0x4c1d95, 1);
      door.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
      
      door.fillStyle(0x38bdf8, 0.6);
      door.fillRect(4, 4, TILE_SIZE - 8, TILE_SIZE / 2);

      door.setPosition(px, py);
      
      this.doorGraphics.set(zone.id, door);
    }
  }

  public openDoor(zoneId: string): void {
    const door = this.doorGraphics.get(zoneId);
    if (!door) return;
    
    this.scene.tweens.add({
      targets: door,
      x: door.x + TILE_SIZE - 4,
      alpha: 0.5,
      duration: 300,
      ease: "Quad.easeOut",
    });
  }

  public closeDoor(zoneId: string): void {
    const door = this.doorGraphics.get(zoneId);
    if (!door) return;

    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    
    this.scene.tweens.add({
      targets: door,
      x: zone.doorTile.x * TILE_SIZE,
      alpha: 1,
      duration: 300,
      ease: "Quad.easeOut",
    });
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
        case "desk": {
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillRect(px + 4, py + 12, pw - 8, ph - 10);
          
          gfx.fillStyle(0xb45309, 1); // Amber
          gfx.fillRect(px + 2, py + 2, pw - 4, ph - 12);
          
          gfx.fillStyle(0xd97706, 1); 
          gfx.fillRect(px + 2, py + 2, pw - 4, 4);
          
          gfx.fillStyle(0x1e293b, 1);
          gfx.fillRect(px + 6, py + 4, pw / 2 - 8, 8);
          gfx.fillStyle(0x38bdf8, 0.4);
          gfx.fillRect(px + 7, py + 5, pw / 2 - 10, 6);
          
          gfx.fillStyle(0x000000, 0.4);
          gfx.fillCircle(px + pw / 2, py + ph - 2, 8); 
          
          gfx.fillStyle(0x334155, 1);
          gfx.fillRoundedRect(px + pw / 2 - 8, py + ph - 8, 16, 12, 4); 
          gfx.fillStyle(0x475569, 1);
          gfx.fillRoundedRect(px + pw / 2 - 8, py + ph - 8, 16, 4, 2); 
          
          gfx.fillStyle(0x1e293b, 1);
          gfx.fillRoundedRect(px + pw / 2 - 6, py + ph - 2, 12, 4, 2); 
          break;
        }
        case "plant": {
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillCircle(px + pw / 2, py + ph - 6, 10);
          
          gfx.fillStyle(0x78350f, 1);
          gfx.fillRoundedRect(px + pw / 2 - 10, py + ph - 20, 20, 16, 4);
          gfx.fillStyle(0x92400e, 1);
          gfx.fillRoundedRect(px + pw / 2 - 10, py + ph - 20, 20, 4, 2);
          
          gfx.fillStyle(0x166534, 1);
          gfx.fillCircle(px + pw / 2 - 8, py + ph - 24, 10);
          gfx.fillCircle(px + pw / 2 + 8, py + ph - 22, 9);
          gfx.fillCircle(px + pw / 2, py + ph - 30, 12);
          
          gfx.fillStyle(0x22c55e, 1);
          gfx.fillCircle(px + pw / 2 - 6, py + ph - 26, 6);
          gfx.fillCircle(px + pw / 2 + 6, py + ph - 24, 5);
          gfx.fillCircle(px + pw / 2, py + ph - 30, 8);
          break;
        }
        case "table": {
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillRect(px + 4, py + 12, pw - 8, ph - 10);
          gfx.fillStyle(0x475569, 1); 
          gfx.fillRect(px + 4, py + 4, pw - 8, ph - 12);
          
          for (let i = 0; i < (w - 2); i += 2) {
            gfx.fillStyle(0xef4444, 1);
            gfx.fillRoundedRect(px + 32 + (i * TILE_SIZE), py - 6, 16, 12, 4);
            gfx.fillRoundedRect(px + 32 + (i * TILE_SIZE), py + ph - 10, 16, 12, 4);
          }
          break;
        }
        case "chair": {
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillRect(px + 8, py + 12, TILE_SIZE - 16, TILE_SIZE - 14);
          
          gfx.fillStyle(0x1e293b, 1); // Dark base
          gfx.fillRoundedRect(px + 12, py + 16, TILE_SIZE - 24, TILE_SIZE - 24, 4);
          
          gfx.fillStyle(f.color, 1); // Custom seat color
          gfx.fillRoundedRect(px + 10, py + 10, TILE_SIZE - 20, TILE_SIZE - 20, 6);
          break;
        }
        case "couch": {
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillRect(px + 2, py + 8, pw - 4, ph - 6);
          gfx.fillStyle(f.color, 1);
          gfx.fillRoundedRect(px + 2, py + 2, pw - 4, ph - 4, 6);
          gfx.fillStyle(Phaser.Display.Color.IntegerToColor(f.color).brighten(15).color, 1);
          gfx.fillRoundedRect(px + 6, py + 6, pw - 12, ph - 10, 3);
          break;
        }
        case "table_round": {
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillCircle(px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 6, TILE_SIZE / 2.5);
          gfx.fillStyle(0xf8fafc, 1);
          gfx.fillCircle(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2.5);
          break;
        }
        case "koi_pond": {
          // Koi Pond
          gfx.fillStyle(0x475569, 1); // stones
          gfx.fillRoundedRect(px + 4, py + 4, pw - 8, ph - 8, 16);
          gfx.fillStyle(0x0284c7, 0.8); // water
          gfx.fillRoundedRect(px + 12, py + 12, pw - 24, ph - 24, 12);
          
          // Koi fish
          gfx.fillStyle(0xf97316, 1);
          gfx.fillCircle(px + 24, py + 24, 4);
          gfx.fillCircle(px + pw - 24, py + ph - 24, 4);
          
          // Lily pads
          gfx.fillStyle(0x15803d, 1);
          gfx.fillCircle(px + 20, py + ph - 20, 8);
          gfx.fillCircle(px + pw - 20, py + 20, 6);
          break;
        }
        case "coffee_machine": {
          // Kitchen Counter
          gfx.fillStyle(0x000000, 0.3);
          gfx.fillRect(px, py + 8, pw, ph - 4);
          gfx.fillStyle(0x334155, 1);
          gfx.fillRect(px, py, pw, ph - 8);
          gfx.fillStyle(0x1e293b, 1);
          gfx.fillRect(px, py, pw, 4);
          
          // Machine
          gfx.fillStyle(0x94a3b8, 1);
          gfx.fillRect(px + 12, py + 4, 24, ph - 16);
          gfx.fillStyle(0x0f172a, 1);
          gfx.fillRect(px + 16, py + 8, 16, 8);
          break;
        }
      }
    }
  }

  private drawZoneLabels(): void {
    for (const zone of ZONES) {
      if (zone.id === "break_area") continue;
      
      const b = zone.bounds;
      const centerX = ((b.x1 + b.x2 + 1) / 2) * TILE_SIZE;
      const topY = b.y1 * TILE_SIZE + 4;

      this.scene.add
        .text(centerX, topY, zone.label, {
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          fontSize: "10px",
          color: Phaser.Display.Color.IntegerToColor(zone.labelColor).rgba,
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0)
        .setDepth(5)
        .setAlpha(0.8);
    }
  }
}
