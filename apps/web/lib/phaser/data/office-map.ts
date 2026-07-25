export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 20;
export const TILE_SIZE = 32;

export interface ZoneDef {
  id: string;
  label: string;
  bounds: { x1: number; y1: number; x2: number; y2: number };
  doorTile: { x: number; y: number };
  color: number;
  labelColor: number;
}

export const ZONES: ZoneDef[] = [
  {
    id: "room_a",
    label: "Meeting A",
    bounds: { x1: 1, y1: 1, x2: 5, y2: 5 },
    doorTile: { x: 6, y: 3 },
    color: 0x4f46e5,
    labelColor: 0x818cf8,
  },
  {
    id: "room_b",
    label: "Meeting B",
    bounds: { x1: 24, y1: 1, x2: 28, y2: 5 },
    doorTile: { x: 23, y: 3 },
    color: 0x0891b2,
    labelColor: 0x22d3ee,
  },
  {
    id: "room_c",
    label: "Focus C",
    bounds: { x1: 1, y1: 14, x2: 5, y2: 18 },
    doorTile: { x: 6, y: 16 },
    color: 0x7c3aed,
    labelColor: 0xa78bfa,
  },
  {
    id: "room_d",
    label: "Focus D",
    bounds: { x1: 24, y1: 14, x2: 28, y2: 18 },
    doorTile: { x: 23, y: 16 },
    color: 0x059669,
    labelColor: 0x34d399,
  },
  {
    id: "lounge",
    label: "Lounge",
    bounds: { x1: 11, y1: 8, x2: 18, y2: 12 },
    doorTile: { x: -1, y: -1 },
    color: 0xd97706,
    labelColor: 0xfbbf24,
  },
];

export interface FurnitureDef {
  x: number;
  y: number;
  type: "table" | "desk" | "couch" | "table_round" | "plant" | "bookshelf";
  color: number;
  width?: number;
  height?: number;
}

export const FURNITURE: FurnitureDef[] = [
  // Room A — conference table
  { x: 2, y: 3, type: "table", color: 0x78716c, width: 3, height: 1 },
  // Room B — conference table
  { x: 25, y: 3, type: "table", color: 0x78716c, width: 3, height: 1 },
  // Room C — individual desks
  { x: 2, y: 16, type: "desk", color: 0x92400e },
  { x: 4, y: 16, type: "desk", color: 0x92400e },
  // Room D — individual desks
  { x: 25, y: 16, type: "desk", color: 0x92400e },
  { x: 27, y: 16, type: "desk", color: 0x92400e },
  // Lounge — seating arrangement
  { x: 13, y: 9, type: "couch", color: 0x6366f1, width: 2, height: 1 },
  { x: 13, y: 11, type: "couch", color: 0x6366f1, width: 2, height: 1 },
  { x: 16, y: 10, type: "table_round", color: 0x78716c },
  // Decorative plants
  { x: 8, y: 1, type: "plant", color: 0x22c55e },
  { x: 21, y: 1, type: "plant", color: 0x22c55e },
  { x: 8, y: 18, type: "plant", color: 0x22c55e },
  { x: 21, y: 18, type: "plant", color: 0x22c55e },
  { x: 10, y: 7, type: "plant", color: 0x16a34a },
  { x: 19, y: 7, type: "plant", color: 0x16a34a },
  { x: 10, y: 12, type: "plant", color: 0x16a34a },
  { x: 19, y: 12, type: "plant", color: 0x16a34a },
  // Bookshelves along walls
  { x: 9, y: 0, type: "bookshelf", color: 0x92400e },
  { x: 10, y: 0, type: "bookshelf", color: 0x92400e },
  { x: 19, y: 0, type: "bookshelf", color: 0x92400e },
  { x: 20, y: 0, type: "bookshelf", color: 0x92400e },
];

export const COLORS = {
  FLOOR_A: 0xf8fafc,
  FLOOR_B: 0xf1f5f9,
  WALL: 0xe2e8f0,
  WALL_FACE: 0xcbd5e1,
  GRID_LINE: 0xe2e8f0,
  DOOR_GLOW: 0xf59e0b,
};

export function generateCollisionGrid(): number[][] {
  const grid: number[][] = Array.from({ length: MAP_HEIGHT }, () =>
    new Array(MAP_WIDTH).fill(0)
  );

  for (let x = 0; x < MAP_WIDTH; x++) {
    grid[0][x] = 1;
    grid[MAP_HEIGHT - 1][x] = 1;
  }
  for (let y = 0; y < MAP_HEIGHT; y++) {
    grid[y][0] = 1;
    grid[y][MAP_WIDTH - 1] = 1;
  }

  function addRoomWalls(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    doorX: number,
    doorY: number
  ): void {
    for (let x = x1; x <= x2; x++) {
      if (y1 >= 0) grid[y1][x] = 1;
      if (y2 < MAP_HEIGHT) grid[y2][x] = 1;
    }
    for (let y = y1; y <= y2; y++) {
      if (x1 >= 0) grid[y][x1] = 1;
      if (x2 < MAP_WIDTH) grid[y][x2] = 1;
    }
    if (doorX >= 0 && doorY >= 0) {
      grid[doorY][doorX] = 0;
    }
  }

  // Room A walls (boundary: cols 0-6, rows 0-6, door at col 6 row 3)
  addRoomWalls(0, 0, 6, 6, 6, 3);
  grid[4][6] = 0; // Widen door A
  // Room B walls (boundary: cols 23-29, rows 0-6, door at col 23 row 3)
  addRoomWalls(23, 0, 29, 6, 23, 3);
  grid[4][23] = 0; // Widen door B
  // Room C walls (boundary: cols 0-6, rows 13-19, door at col 6 row 16)
  addRoomWalls(0, 13, 6, 19, 6, 16);
  grid[15][6] = 0; // Widen door C
  // Room D walls (boundary: cols 23-29, rows 13-19, door at col 23 row 16)
  addRoomWalls(23, 13, 29, 19, 23, 16);
  grid[15][23] = 0; // Widen door D

  for (const f of FURNITURE) {
    const w = f.width ?? 1;
    const h = f.height ?? 1;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const fx = f.x + dx;
        const fy = f.y + dy;
        if (fx >= 0 && fx < MAP_WIDTH && fy >= 0 && fy < MAP_HEIGHT) {
          if (f.type !== "couch" && f.type !== "desk") {
            grid[fy][fx] = 1;
          }
        }
      }
    }
  }

  return grid;
}

export function getZoneAtTile(tileX: number, tileY: number): string | null {
  for (const zone of ZONES) {
    const b = zone.bounds;
    if (tileX >= b.x1 && tileX <= b.x2 && tileY >= b.y1 && tileY <= b.y2) {
      return zone.id;
    }
  }
  return null;
}

export function getFurnitureAt(
  tileX: number,
  tileY: number
): FurnitureDef | null {
  for (const f of FURNITURE) {
    const w = f.width ?? 1;
    const h = f.height ?? 1;
    if (tileX >= f.x && tileX < f.x + w && tileY >= f.y && tileY < f.y + h) {
      return f;
    }
  }
  return null;
}
