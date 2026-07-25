import * as Colyseus from "colyseus.js";

const COLYSEUS_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_COLYSEUS_URL ?? "ws://localhost:2567")
    : "ws://localhost:2567";

let clientInstance: Colyseus.Client | null = null;

export function getColyseusClient(): Colyseus.Client {
  if (!clientInstance) {
    clientInstance = new Colyseus.Client(COLYSEUS_URL);
  }
  return clientInstance;
}

export async function joinWorkspaceRoom(
  options: { name: string; avatarUrl?: string } = { name: "Player" }
): Promise<Colyseus.Room> {
  const client = getColyseusClient();
  const room = await client.joinOrCreate("workspace", options);
  return room;
}
