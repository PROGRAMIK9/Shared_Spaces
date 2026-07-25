import { Schema, type, MapSchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";
import { ZoneState } from "./ZoneState";

export class WorkspaceState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: ZoneState }) zones = new MapSchema<ZoneState>();
}
