import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { musicRouter } from "./routes/music";
import { uploadRouter } from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/music", musicRouter);
app.use("/api/upload", uploadRouter);

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Solace server running on http://localhost:${PORT}`);
});

export default app;
