"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, X, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const MUSIC_SERVER =
  process.env.NEXT_PUBLIC_MUSIC_SERVER_URL || "http://localhost:4000";

function formatTime(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MusicPlayerView(props: {
  node: {
    attrs: {
      videoId: string;
      title: string;
      artist: string;
      thumbnail: string;
      duration: number;
      float: string;
      width: number;
    };
  };
  selected: boolean;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
  editor: { isEditable: boolean };
}) {
  const { videoId, title, artist, duration, float: floatDir, width } = props.node.attrs;
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [playerWidth, setPlayerWidth] = useState(width || 280);
  const [isResizing, setIsResizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);

  // ── Resize ───────────────────────────────────────
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const clampWidth = useCallback((w: number) => {
    const maxW = (wrapperRef.current?.closest(".ProseMirror")?.clientWidth || 650) - 20;
    return Math.max(140, Math.min(w, maxW));
  }, []);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = playerWidth;

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startXRef.current;
        setPlayerWidth(clampWidth(startWidthRef.current + delta));
      };
      const onUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [playerWidth, clampWidth]
  );

  useEffect(() => {
    if (width && width !== playerWidth && !isResizing) setPlayerWidth(width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  useEffect(() => {
    if (!isResizing && playerWidth !== (width || 280)) {
      props.updateAttributes({ width: playerWidth });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  // ── Audio ────────────────────────────────────────
  const loadAudio = useCallback(async () => {
    if (audioSrc) return audioSrc;
    setIsLoading(true);
    try {
      const res = await fetch(`${MUSIC_SERVER}/api/music/info/${videoId}`);
      if (!res.ok) throw new Error("Failed to get audio");
      const data = await res.json();
      setAudioSrc(data.audioUrl);
      if (data.duration) setAudioDuration(data.duration);
      return data.audioUrl;
    } catch (err) {
      console.error("Failed to load audio:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [videoId, audioSrc]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      let src = audioSrc;
      if (!src) {
        src = await loadAudio();
        if (!src) return;
      }
      if (audio.src !== src) audio.src = src;
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Play error:", err);
      }
    }
  }, [isPlaying, audioSrc, loadAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => {
      if (audio.duration && !isNaN(audio.duration)) setAudioDuration(audio.duration);
    };
    const onEnd = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !audioDuration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * audioDuration;
      setCurrentTime(audio.currentTime);
    },
    [audioDuration]
  );

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  const cycleFloat = () => {
    const next = floatDir === "left" ? "right" : floatDir === "right" ? "none" : "left";
    props.updateAttributes({ float: next });
  };

  const floatLabel = floatDir === "left" ? "Left" : floatDir === "right" ? "Right" : "Center";

  // Compact layout when width < 200
  const isCompact = playerWidth < 200;

  return (
    <NodeViewWrapper className={cn(
      "solace-music-wrap",
      floatDir === "left" && "solace-float-left",
      floatDir === "right" && "solace-float-right",
      floatDir === "none" && "solace-float-none",
    )}>
      <div
        ref={wrapperRef}
        contentEditable={false}
        className="relative select-none"
        style={{ width: playerWidth }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isResizing && setShowControls(false)}
      >
        {/* Player card */}
        <div className={cn(
          "relative bg-secondary border border-border rounded-lg px-2.5 py-2",
          props.selected && "ring-2 ring-foreground/50",
          isCompact ? "flex flex-col gap-1.5" : "flex items-center gap-2"
        )}>
          {/* Controls inside card — overlaid */}
          {showControls && props.editor.isEditable && (
            <>
              <button
                onClick={cycleFloat}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-1 left-1 h-5 flex items-center gap-0.5 px-1 rounded bg-black/60 text-white hover:bg-black/80 transition-colors text-[9px] z-10"
                title={`Position: ${floatLabel}`}
              >
                <MoveHorizontal className="h-2.5 w-2.5" />
                <span>{floatLabel}</span>
              </button>
              <button
                onClick={props.deleteNode}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                title="Remove"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </>
          )}
          {/* Play button + info */}
          <div className={cn(isCompact ? "flex items-center gap-2" : "flex items-center gap-2 min-w-0 flex-1")}>
            <button
              onClick={togglePlay}
              onMouseDown={(e) => e.preventDefault()}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
            >
              {isLoading ? (
                <div className="h-3 w-3 border-[1.5px] border-background border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3 ml-px" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{artist}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className={cn("flex items-center gap-1.5", isCompact ? "w-full" : "min-w-0 flex-1")}>
            <span className="text-[9px] text-muted-foreground tabular-nums">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              onClick={handleSeek}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 h-1 bg-border rounded-full cursor-pointer relative"
            >
              <div className="absolute top-0 left-0 h-full bg-foreground rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[9px] text-muted-foreground tabular-nums">{formatTime(audioDuration)}</span>
          </div>
        </div>

        {/* Resize handle */}
        {showControls && props.editor.isEditable && (
          <div
            onMouseDown={onResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
          >
            <svg viewBox="0 0 16 16" className="w-full h-full text-muted-foreground">
              <path d="M14 14L8 14M14 14L14 8M14 14L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        )}

        <audio ref={audioRef} preload="none" />
      </div>
    </NodeViewWrapper>
  );
}

export const MusicNode = Node.create({
  name: "musicBlock",
  group: "block",
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      videoId: { default: "" },
      title: { default: "Unknown" },
      artist: { default: "Unknown" },
      thumbnail: { default: "" },
      duration: { default: 0 },
      float: { default: "left" },
      width: { default: 280 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="music-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "music-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MusicPlayerView);
  },
});
