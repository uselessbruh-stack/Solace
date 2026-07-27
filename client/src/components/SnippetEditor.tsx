"use client";

import { useRef, useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SnippetEditorProps {
  audioUrl: string;
  duration: number;
  snippetStart: number;
  snippetEnd: number;
  onChange: (start: number, end: number) => void;
  className?: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SnippetEditor({
  audioUrl,
  duration,
  snippetStart,
  snippetEnd,
  onChange,
  className,
}: SnippetEditorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(snippetStart);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= snippetEnd) {
        audio.pause();
        audio.currentTime = snippetStart;
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [snippetStart, snippetEnd]);

  const previewSnippet = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = snippetStart;
    audio.play();
    setIsPlaying(true);
  };

  const maxDuration = duration || 300;

  return (
    <div className={cn("space-y-6", className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="relative h-16 rounded-xl bg-secondary overflow-hidden">
        <div
          className="absolute inset-y-0 bg-primary/20 border-x-2 border-primary"
          style={{
            left: `${(snippetStart / maxDuration) * 100}%`,
            width: `${((snippetEnd - snippetStart) / maxDuration) * 100}%`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white"
          style={{ left: `${(currentTime / maxDuration) * 100}%` }}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Start</Label>
            <span className="text-sm text-muted-foreground">
              {formatTime(snippetStart)}
            </span>
          </div>
          <Slider
            value={[snippetStart]}
            min={0}
            max={Math.max(0, snippetEnd - 5)}
            step={1}
            onValueChange={(value) => {
              const val = Array.isArray(value) ? value[0] : value;
              onChange(val, snippetEnd);
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>End</Label>
            <span className="text-sm text-muted-foreground">
              {formatTime(snippetEnd)}
            </span>
          </div>
          <Slider
            value={[snippetEnd]}
            min={snippetStart + 5}
            max={maxDuration}
            step={1}
            onValueChange={(value) => {
              const val = Array.isArray(value) ? value[0] : value;
              onChange(snippetStart, val);
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Snippet: {formatTime(snippetEnd - snippetStart)}</span>
        <button
          type="button"
          onClick={previewSnippet}
          className="text-primary hover:text-primary/80 font-medium"
        >
          {isPlaying ? "Playing..." : "Preview snippet"}
        </button>
      </div>
    </div>
  );
}
