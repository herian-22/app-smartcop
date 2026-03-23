import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  // API routes
  app.get("/api/status", (req, res) => {
    res.json({
      status: "NORMAL",
      temperature: 30.5,
      humidity: 82,
      mae_error: 0.0241,
      adaptivity: { current: 3.15, target: 3.20 },
      ram: { used: 142, total: 320 },
      cpu: 24,
      storage: 92
    });
  });

  // Mock real-time logs
  const logs = [
    "Socket connection established to node_0x42",
    "SUCCESS: Calibration packet received from Cage 1",
    "Telemetry payload (32 bytes) parsed in 2.4ms",
    "WARN: Potential latent oscillation in Humidity sensor B",
    "Synchronizing RTC with NTP server pool.ntp.org"
  ];

  io.on("connection", (socket) => {
    console.log("Client connected");
    
    // Send initial logs
    logs.forEach((log, i) => {
      setTimeout(() => {
        socket.emit("log", {
          timestamp: new Date(Date.now() - (5 - i) * 1000).toLocaleTimeString(),
          message: log,
          type: log.includes("SUCCESS") ? "success" : log.includes("WARN") ? "warn" : "info"
        });
      }, i * 500);
    });

    // Simulate periodic logs
    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      socket.emit("log", {
        timestamp: new Date().toLocaleTimeString(),
        message: randomLog,
        type: randomLog.includes("SUCCESS") ? "success" : randomLog.includes("WARN") ? "warn" : "info"
      });
    }, 5000);

    socket.on("disconnect", () => {
      clearInterval(interval);
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
