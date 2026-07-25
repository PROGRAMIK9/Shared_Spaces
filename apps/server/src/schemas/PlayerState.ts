import { Schema, type } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") sessionId: string = "";
  @type("string") name: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") targetX: number = 0;
  @type("number") targetY: number = 0;
  @type("string") direction: string = "down";
  @type("string") animation: string = "idle";
  @type("string") currentZone: string = "main";
  @type("boolean") isTabShifted: boolean = false;
  @type("string") avatarUrl: string = "";
}
