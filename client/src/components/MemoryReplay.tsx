"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Memory } from "@/types";
import { format } from "date-fns";
import { MOODS } from "@/types";

interface MemoryReplayProps {
  memory: Memory;
  onClose: () => void;
}

export function MemoryReplay({ memory, onClose }: MemoryReplayProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const mood = MOODS.find((m) => m.value === memory.mood);
  const photos = memory.photos;
  const hasMusic = !!memory.music;

  const nextPhoto = useCallback(() => {
    setPhotoIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!isPlaying || photos.length <= 1) return;
    const timer = setInterval(nextPhoto, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, photos.length, nextPhoto]);
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !memory.music) return;

    const start = memory.music.snippetStart;
    const end = memory.music.snippetEnd;

    const handleLoaded = () => {
      audio.currentTime = start;

      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    const handleTime = () => {
      if (audio.currentTime >= end) {
        audio.currentTime = start;
      }
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
    };
  }, [memory.music]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft")
        setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, nextPhoto, photos.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
      onClick={() => setShowInfo((s) => !s)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={photoIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {photos[photoIndex] && (
            <Image
              src={photos[photoIndex].url}
              alt={memory.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-0 bottom-0 p-8 pointer-events-none"
          >
            <p className="text-sm text-white/60 mb-2">
              {format(new Date(memory.createdAt), "MMMM d, yyyy")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {memory.title}
            </h1>
            {memory.description && (
              <p className="text-white/80 max-w-xl text-lg leading-relaxed">
                {memory.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-4">
              {mood && (
                <span className="text-sm text-white/70">
                  {mood.emoji} {mood.label}
                </span>
              )}
              {memory.location && (
                <span className="text-sm text-white/70">📍 {memory.location}</span>
              )}
              {hasMusic && memory.music && (
                <span className="text-sm text-white/70">
                  🎵 {memory.music.title} — {memory.music.artist}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying((p) => !p);
          }}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-10"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === photoIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
              />
            ))}
          </div>
        </>
      )}

      {hasMusic && memory.music && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          src={memory.music.audioUrl}
          preload="auto"
          className="hidden"
        />
      )}
    </motion.div>
  );
}
