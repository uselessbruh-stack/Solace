"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types";
import { Button } from "@/components/ui/button";

interface PhotoCarouselProps {
  photos: Photo[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function PhotoCarousel({
  photos,
  className,
  autoPlay = false,
  interval = 5000,
}: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % photos.length);
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);

  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div className={cn("relative aspect-[16/10] overflow-hidden rounded-xl", className)}>
        <Image
          src={photos[0].url}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-secondary">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={photos[current].url}
              alt=""
              fill
              className="object-cover"
              priority={current === 0}
            />
          </motion.div>
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
