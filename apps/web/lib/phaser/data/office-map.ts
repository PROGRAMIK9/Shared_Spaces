export const NUMBER_OF_EMPLOYEES = 24;
export const MAP_WIDTH = 70;
export const MAP_HEIGHT = 50;
export const TILE_SIZE = 48;

export interface ZoneDef {
  id: string;
  label: string;
  bounds: { x1: number; y1: number; x2: number; y2: number };
  doorTile: { x: number; y: number };
  color: number;
  labelColor: number;
}

export interface FurnitureDef {
  x: number;
  y: number;
  type: "table" | "desk" | "couch" | "table_round" | "plant" | "bookshelf" | "koi_pond" | "coffee_machine";
  color: number;
  width?: number;
  height?: number;
}

function generateMapData() {
  const zones: ZoneDef[] = [
    // Offices (Row of 3 on the left)
    { id: "office_1", label: "Office 1", bounds: { x1: 15, y1: 12, x2: 24, y2: 22 }, doorTile: { x: 19, y: 23 }, color: 0xe2e8f0, labelColor: 0x64748b },
    { id: "office_2", label: "Office 2", bounds: { x1: 25, y1: 12, x2: 34, y2: 22 }, doorTile: { x: 29, y: 23 }, color: 0xe2e8f0, labelColor: 0x64748b },
    { id: "office_3", label: "Office 3", bounds: { x1: 35, y1: 12, x2: 44, y2: 22 }, doorTile: { x: 39, y: 23 }, color: 0xe2e8f0, labelColor: 0x64748b },
    
    // Meeting Rooms (Right Side)
    { id: "meeting_large", label: "Boardroom", bounds: { x1: 48, y1: 26, x2: 65, y2: 38 }, doorTile: { x: 47, y: 32 }, color: 0xe2e8f0, labelColor: 0x64748b },
    { id: "meeting_casual", label: "Huddle Room", bounds: { x1: 48, y1: 12, x2: 65, y2: 22 }, doorTile: { x: 47, y: 17 }, color: 0xe2e8f0, labelColor: 0x64748b },
    
    // Open Areas (No doors)
    { id: "team_area", label: "Coworking: Team", bounds: { x1: 15, y1: 26, x2: 44, y2: 45 }, doorTile: { x: -1, y: -1 }, color: 0xf8fafc, labelColor: 0x64748b },
    { id: "lobby", label: "Coworking: Lobby", bounds: { x1: 2, y1: 26, x2: 12, y2: 38 }, doorTile: { x: -1, y: -1 }, color: 0xf8fafc, labelColor: 0x64748b },
    { id: "koi_pond", label: "Coworking: Koi Pond", bounds: { x1: 15, y1: 2, x2: 44, y2: 10 }, doorTile: { x: -1, y: -1 }, color: 0xdcfce7, labelColor: 0x64748b },
    { id: "break_area", label: "Kitchen", bounds: { x1: 2, y1: 12, x2: 12, y2: 22 }, doorTile: { x: -1, y: -1 }, color: 0xf8fafc, labelColor: 0x64748b },
  ];

  const furniture: FurnitureDef[] = [];
  
  // Office 1
  furniture.push({ x: 18, y: 16, type: "desk", color: 0xd97706, width: 4, height: 2 });
  furniture.push({ x: 23, y: 13, type: "plant", color: 0x16a34a });
  // Office 2
  furniture.push({ x: 28, y: 16, type: "desk", color: 0xd97706, width: 4, height: 2 });
  furniture.push({ x: 33, y: 13, type: "plant", color: 0x16a34a });
  // Office 3
  furniture.push({ x: 38, y: 16, type: "desk", color: 0xd97706, width: 4, height: 2 });
  furniture.push({ x: 43, y: 13, type: "plant", color: 0x16a34a });

  // Team Area (Banks of Desks)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      furniture.push({ x: 18 + col * 8, y: 30 + row * 8, type: "desk", color: 0xd97706, width: 4, height: 2 });
    }
  }
  
  // Large Meeting Room
  furniture.push({ x: 52, y: 30, type: "table", color: 0xfef08a, width: 8, height: 4 });
  
  // Casual Meeting Room
  furniture.push({ x: 55, y: 16, type: "table_round", color: 0xe2e8f0 });
  furniture.push({ x: 62, y: 13, type: "bookshelf", color: 0x1e293b, width: 2, height: 1 });

  // Lobby
  furniture.push({ x: 5, y: 31, type: "table", color: 0xd97706, width: 4, height: 2 });
  furniture.push({ x: 5, y: 29, type: "couch", color: 0x475569, width: 4, height: 1 });
  furniture.push({ x: 3, y: 31, type: "couch", color: 0x475569, width: 1, height: 2 });
  furniture.push({ x: 10, y: 31, type: "couch", color: 0x475569, width: 1, height: 2 });
  
  // Koi Pond
  furniture.push({ x: 28, y: 4, type: "koi_pond", color: 0x38bdf8, width: 6, height: 4 });
  furniture.push({ x: 26, y: 6, type: "plant", color: 0x15803d });
  furniture.push({ x: 35, y: 6, type: "plant", color: 0x15803d });
  
  // Kitchen
  furniture.push({ x: 3, y: 13, type: "coffee_machine", color: 0x334155, width: 4, height: 2 });
  furniture.push({ x: 5, y: 18, type: "table_round", color: 0x94a3b8 });
  furniture.push({ x: 9, y: 18, type: "table_round", color: 0x94a3b8 });

  return { zones, furniture };
}

const mapData = generateMapData();
export const ZONES = mapData.zones;
export const FURNITURE = mapData.furniture;

export const COLORS = {
  FLOOR_A: 0xffedd5, // warm beige floor
  GRID_LINE: 0xfed7aa,
  WALL: 0xd6d3d1, // Light warm stone wall
  WALL_FACE: 0xa8a29e,
  DOOR_GLOW: 0xf59e0b,
};

export function generateCollisionGrid(): number[][] {
  const grid: number[][] = Array.from({ length: MAP_HEIGHT }, () =>
    new Array(MAP_WIDTH).fill(0)
  );

  // Borders
  for (let x = 0; x < MAP_WIDTH; x++) {
    grid[0][x] = 1;
    grid[MAP_HEIGHT - 1][x] = 1;
  }
  for (let y = 0; y < MAP_HEIGHT; y++) {
    grid[y][0] = 1;
    grid[y][MAP_WIDTH - 1] = 1;
  }

  function addRoomWalls(x1: number, y1: number, x2: number, y2: number, doorX: number, doorY: number): void {
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

  ZONES.forEach(zone => {
    if (zone.id === "team_area" || zone.id === "lobby" || zone.id === "koi_pond" || zone.id === "break_area") return;
    const b = zone.bounds;
    addRoomWalls(b.x1 - 1, b.y1 - 1, b.x2 + 1, b.y2 + 1, zone.doorTile.x, zone.doorTile.y);
  });

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

export function getFurnitureAt(tileX: number, tileY: number): FurnitureDef | null {
  for (const f of FURNITURE) {
    const w = f.width ?? 1;
    const h = f.height ?? 1;
    if (tileX >= f.x && tileX < f.x + w && tileY >= f.y && tileY < f.y + h) {
      return f;
    }
  }
  return null;
}
