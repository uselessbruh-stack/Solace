"use client";

import WaveSurfer from "wavesurfer.js";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Props {
  waveSurfer: WaveSurfer | null;
  start: number;
  end: number;
  currentTime: number;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioControls({
  waveSurfer,
  start,
  end,
  currentTime,
}: Props) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!waveSurfer) return;

    const playHandler = () => setPlaying(true);
    const pauseHandler = () => setPlaying(false);

    waveSurfer.on("play", playHandler);
    waveSurfer.on("pause", pauseHandler);

    return () => {
      waveSurfer.un("play", playHandler);
      waveSurfer.un("pause", pauseHandler);
    };
  }, [waveSurfer]);

  const playPause = () => {
    if (!waveSurfer) return;

    if (waveSurfer.isPlaying()) {
      waveSurfer.pause();
    } else {
      if (waveSurfer.getCurrentTime() >= end || waveSurfer.getCurrentTime() < start) {
        waveSurfer.setTime(start);
      }
      waveSurfer.play();
    }
  };

  const jumpStart = () => {
    waveSurfer?.setTime(start);
  };

  const jumpEnd = () => {
    waveSurfer?.setTime(Math.max(start, end - 0.5));
  };

  const snippetLength = Math.max(0, end - start);
  const relativeTime = Math.max(0, Math.min(snippetLength, currentTime - start));

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime(relativeTime)}</span>
        <span>{formatTime(snippetLength)}</span>
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button variant="ghost" size="icon" onClick={jumpStart} disabled={!waveSurfer}>
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          className="rounded-full h-14 w-14"
          onClick={playPause}
          disabled={!waveSurfer}
        >
          {playing ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={jumpEnd} disabled={!waveSurfer}>
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
