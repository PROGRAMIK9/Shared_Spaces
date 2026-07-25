import { Schema, type } from "@colyseus/schema";

export class ZoneState extends Schema {
  @type("string") zoneId: string = "";
  @type("boolean") isLocked: boolean = false;
  @type("string") ownerId: string = "";
}
