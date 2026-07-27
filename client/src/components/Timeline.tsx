"use client";

import { MemoryCard } from "@/components/MemoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Memory } from "@/types";

interface TimelineProps {
  memories: Memory[];
  isLoading?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function Timeline({ memories, isLoading, onToggleFavorite }: TimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 pl-8">
            <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-3xl">📸</span>
        </div>
        <h3 className="text-lg font-semibold">No memories yet</h3>
        <p className="text-muted-foreground mt-1 max-w-sm">
          Start capturing your moments with photos, music, and notes.
        </p>
      </div>
    );
  }

  const grouped = memories.reduce<Record<string, Memory[]>>((acc, memory) => {
    const date = new Date(memory.createdAt);
    const key = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(memory);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([month, monthMemories]) => (
        <section key={month}>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            {month}
          </h2>
          <div>
            {monthMemories.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                variant="timeline"
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
