import { Router, type Request, type Response } from "express";
import { searchMusic, getMusicInfo, getAudioStreamUrl } from "../services/ytdlp";

export const musicRouter = Router();

/**
 * GET /api/music/search?q=...&limit=10
 * Search YouTube for music tracks
 */
musicRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);

    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: "Query parameter 'q' is required" });
      return;
    }

    const results = await searchMusic(query.trim(), limit);
    res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error: "Failed to search music. Is yt-dlp installed?",
    });
  }
});

/**
 * GET /api/music/info/:videoId
 * Get metadata + audio URL for a specific track
 */
musicRouter.get("/info/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      res.status(400).json({ error: "Video ID is required" });
      return;
    }

    const info = await getMusicInfo(videoId);
    res.json(info);
  } catch (error) {
    console.error("Info error:", error);
    res.status(500).json({ error: "Failed to get track info" });
  }
});

/**
 * GET /api/music/stream/:videoId
 * Redirects to the direct audio stream URL
 */
musicRouter.get("/stream/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      res.status(400).json({ error: "Video ID is required" });
      return;
    }

    const audioUrl = await getAudioStreamUrl(videoId);

    if (!audioUrl) {
      res.status(404).json({ error: "Audio stream not found" });
      return;
    }

    // Redirect to the actual audio stream URL
    res.redirect(audioUrl);
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({ error: "Failed to get audio stream" });
  }
});
