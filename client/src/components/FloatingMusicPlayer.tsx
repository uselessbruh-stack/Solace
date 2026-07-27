"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/player-store";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FloatingMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    setTrack,
    play,
    pause,
    setCurrentTime,
    setVolume,
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= currentTrack.snippetEnd) {
        audio.pause();
        audio.currentTime = currentTrack.snippetStart;
        pause();
        setCurrentTime(currentTrack.snippetStart);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [currentTrack, volume, pause, setCurrentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      if (audio.currentTime < currentTrack.snippetStart || audio.currentTime >= currentTrack.snippetEnd) {
        audio.currentTime = currentTrack.snippetStart;
      }
      audio.play().catch(() => pause());
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  if (!currentTrack) return null;

  const relativeTime = currentTime - currentTrack.snippetStart;
  const snippetDuration = currentTrack.snippetEnd - currentTrack.snippetStart;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
      >
        <div className="glass rounded-2xl p-4 shadow-2xl">
          {currentTrack && (
            <audio ref={audioRef} src={currentTrack.audioUrl} preload="metadata" />
          )}

          <div className="flex items-center gap-3">
            {currentTrack.coverImage ? (
              <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={currentTrack.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {currentTrack.memoryId ? (
                <Link
                  href={`/memory/${currentTrack.memoryId}`}
                  className="font-medium text-sm truncate hover:text-primary transition-colors block"
                >
                  {currentTrack.memoryTitle}
                </Link>
              ) : (
                <p className="font-medium text-sm truncate">{currentTrack.title}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist} · {currentTrack.title}
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={() => (isPlaying ? pause() : play())}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={() => setTrack(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-8">
              {formatTime(Math.max(0, relativeTime))}
            </span>
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{
                  width: `${Math.min(100, (relativeTime / snippetDuration) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">
              {formatTime(snippetDuration)}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
