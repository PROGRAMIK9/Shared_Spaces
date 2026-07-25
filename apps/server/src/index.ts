import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { monitor } from "@colyseus/monitor";
import express from "express";
import cors from "cors";
import http from "http";
import { WorkspaceRoom } from "./rooms/WorkspaceRoom";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.use("/colyseus", monitor());

const port = Number(process.env.COLYSEUS_PORT) || 2567;

const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("workspace", WorkspaceRoom);

httpServer.listen(port, () => {
  console.log(`🚀 GatherCraft Colyseus server listening on port ${port}`);
  console.log(`📊 Monitor: http://localhost:${port}/colyseus`);
});
