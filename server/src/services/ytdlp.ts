import { spawn } from "child_process";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export interface MusicSearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // seconds
}

export interface MusicInfo {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  audioUrl: string;
}

/**
 * Run a yt-dlp command and return stdout as string
 */
function runYtdlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 30000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start yt-dlp: ${err.message}. Is yt-dlp installed?`));
    });
  });
}

/**
 * Search YouTube for music tracks
 */
export async function searchMusic(
  query: string,
  maxResults = 10
): Promise<MusicSearchResult[]> {
  const cacheKey = `search:${query}:${maxResults}`;
  const cached = cache.get<MusicSearchResult[]>(cacheKey);
  if (cached) return cached;

  try {
    const output = await runYtdlp([
      `ytsearch${maxResults}:${query} music`,
      "--print",
      "%(id)s\t%(title)s\t%(channel)s\t%(thumbnail)s\t%(duration)s",
      "--no-download",
      "--no-warnings",
      "--flat-playlist",
    ]);

    const results: MusicSearchResult[] = output
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [videoId, title, artist, thumbnail, durationStr] = line.split("\t");
        return {
          videoId: videoId || "",
          title: title || "Unknown",
          artist: artist || "Unknown",
          thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          duration: parseInt(durationStr || "0", 10),
        };
      })
      .filter((r) => r.videoId);

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Music search failed:", error);
    throw new Error("Failed to search for music. Make sure yt-dlp is installed.");
  }
}

/**
 * Get detailed info + audio URL for a specific video
 */
export async function getMusicInfo(videoId: string): Promise<MusicInfo> {
  const cacheKey = `info:${videoId}`;
  const cached = cache.get<MusicInfo>(cacheKey);
  if (cached) return cached;

  try {
    const output = await runYtdlp([
      `https://www.youtube.com/watch?v=${videoId}`,
      "--print",
      "%(id)s\t%(title)s\t%(channel)s\t%(thumbnail)s\t%(duration)s",
      "-f",
      "bestaudio[ext=m4a]/bestaudio",
      "--get-url",
      "--no-download",
      "--no-warnings",
    ]);

    const lines = output.split("\n").filter((l) => l.trim());

    // First line is metadata, last line is the audio URL
    const metaLine = lines[0] || "";
    const audioUrl = lines[lines.length - 1] || "";

    const [, title, artist, thumbnail, durationStr] = metaLine.split("\t");

    const info: MusicInfo = {
      videoId,
      title: title || "Unknown",
      artist: artist || "Unknown",
      thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      duration: parseInt(durationStr || "0", 10),
      audioUrl,
    };

    // Cache for 30 minutes (audio URLs expire)
    cache.set(cacheKey, info, 1800);
    return info;
  } catch (error) {
    console.error("Get music info failed:", error);
    throw new Error("Failed to get music info");
  }
}

/**
 * Get just the audio stream URL for a video
 */
export async function getAudioStreamUrl(videoId: string): Promise<string> {
  const cacheKey = `stream:${videoId}`;
  const cached = cache.get<string>(cacheKey);
  if (cached) return cached;

  try {
    const url = await runYtdlp([
      `https://www.youtube.com/watch?v=${videoId}`,
      "-f",
      "bestaudio[ext=m4a]/bestaudio",
      "--get-url",
      "--no-download",
      "--no-warnings",
    ]);

    // Cache for 30 minutes (URLs expire)
    cache.set(cacheKey, url, 1800);
    return url;
  } catch (error) {
    console.error("Get audio stream failed:", error);
    throw new Error("Failed to get audio stream URL");
  }
}
