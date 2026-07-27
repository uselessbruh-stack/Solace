"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MapPin, Music } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Memory } from "@/types";
import { MOODS } from "@/types";
import { usePlayerStore } from "@/stores/player-store";

interface MemoryCardProps {
  memory: Memory;
  onToggleFavorite?: (id: string) => void;
  variant?: "grid" | "timeline";
}

export function MemoryCard({
  memory,
  onToggleFavorite,
  variant = "grid",
}: MemoryCardProps) {
  const setTrack = usePlayerStore((s) => s.setTrack);
  const mood = MOODS.find((m) => m.value === memory.mood);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(memory._id);
  };

  const handlePlayMusic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (memory.music) {
      setTrack({
        ...memory.music,
        memoryId: memory._id,
        memoryTitle: memory.title,
      });
    }
  };

  if (variant === "timeline") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative pl-8 pb-8 last:pb-0"
      >
        <div className="absolute left-0 top-2 h-full w-px bg-border" />
        <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
        <Link href={`/memory/${memory._id}`}>
          <div className="glass-card p-4 hover:bg-card transition-colors group">
            <div className="flex gap-4">
              {memory.photos[0] && (
                <div className="relative h-20 w-20 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={memory.photos[0].url}
                    alt={memory.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold truncate">{memory.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(memory.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <button
                    onClick={handleFavorite}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        memory.favorite && "fill-red-400 text-red-400"
                      )}
                    />
                  </button>
                </div>
                {memory.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {memory.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {mood && (
                    <Badge variant="secondary" className="text-xs">
                      {mood.emoji} {mood.label}
                    </Badge>
                  )}
                  {memory.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {memory.location}
                    </span>
                  )}
                  {memory.music && (
                    <button
                      onClick={handlePlayMusic}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                    >
                      <Music className="h-3 w-3" />
                      {memory.music.title}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/memory/${memory._id}`}>
        <article className="glass-card overflow-hidden group cursor-pointer">
          <div className="relative aspect-[4/3] overflow-hidden">
            {memory.photos[0] ? (
              <Image
                src={memory.photos[0].url}
                alt={memory.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="h-full w-full bg-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No photo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  memory.favorite && "fill-red-400 text-red-400"
                )}
              />
            </button>
            {memory.music && (
              <button
                onClick={handlePlayMusic}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-primary/80 backdrop-blur-sm text-white hover:bg-primary transition-colors"
              >
                <Music className="h-4 w-4" />
              </button>
            )}
            {memory.photos.length > 1 && (
              <Badge className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border-0">
                +{memory.photos.length - 1}
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold truncate">{memory.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(memory.createdAt), "MMM d, yyyy")}
            </p>
            {mood && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {mood.emoji} {mood.label}
              </Badge>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
