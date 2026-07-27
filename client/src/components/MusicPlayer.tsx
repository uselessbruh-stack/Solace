"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Music } from "@/types";

interface MusicPlayerProps {
  music: Music;
  className?: string;
  autoPlay?: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayer({ music, className, autoPlay = false }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(music.snippetStart);
  const snippetDuration = music.snippetEnd - music.snippetStart;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => {
      audio.currentTime = music.snippetStart;
      setCurrentTime(music.snippetStart);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (audio.currentTime >= music.snippetEnd) {
        audio.pause();
        audio.currentTime = music.snippetStart;
        setCurrentTime(music.snippetStart);
        setIsPlaying(false);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [music.snippetStart, music.snippetEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playAudio = async () => {
        try {
          if (audio.readyState < 2) {
            await new Promise<void>((resolve) => {
              audio.oncanplay = () => resolve();
            });
          }

          await audio.play();
        } catch (err) {
          console.error(err);
          setIsPlaying(false);
        }
      };

      playAudio();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying((p) => !p);

  const seek = (value: number | readonly number[]) => {
    const vals = Array.isArray(value) ? value : [value];
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = vals[0];
    setCurrentTime(vals[0]);
  };

  const relativeTime = currentTime - music.snippetStart;

  return (
    <div className={cn("glass-card p-4", className)}>
      <audio
        ref={audioRef}
        src={music.audioUrl}
        preload="auto"
        crossOrigin="anonymous"
        onLoadedMetadata={() => {
          console.log("Metadata loaded");
        }}
        onCanPlay={() => {
          console.log("Can play");
        }}
        onPlay={() => {
          console.log("Playing");
        }}
        onPause={() => {
          console.log("Paused");
        }}
        onError={(e) => {
          console.error("Audio error", e);
        }}
      />

      <div className="flex items-center gap-4">
        {music.coverImage && (
          <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={music.coverImage}
              alt={music.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{music.title}</p>
          <p className="text-sm text-muted-foreground truncate">{music.artist}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Slider
          value={[currentTime]}
          min={music.snippetStart}
          max={music.snippetEnd}
          step={0.1}
          onValueChange={seek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(Math.max(0, relativeTime))}</span>
          <span>{formatTime(snippetDuration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = music.snippetStart;
              setCurrentTime(music.snippetStart);
            }
          }}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = music.snippetEnd;
            }
          }}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
