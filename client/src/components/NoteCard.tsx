"use client";

import { format } from "date-fns";
import { Heart, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteListItem } from "@/types";
import Link from "next/link";

interface NoteCardProps {
  note: NoteListItem;
  onToggleFavorite?: (id: string) => void;
}

export function NoteCard({ note, onToggleFavorite }: NoteCardProps) {
  return (
    <Link href={`/note/${note.id}`}>
      <div className="group rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-accent/30 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            {note.pinned && (
              <Pin className="h-3 w-3 text-muted-foreground inline mr-1 -mt-0.5" />
            )}
            <h3 className="font-medium text-sm truncate inline">
              {note.title || "Untitled"}
            </h3>
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5",
                  note.favorite
                    ? "fill-current text-foreground"
                    : "text-muted-foreground"
                )}
              />
            </button>
          )}
        </div>

        {/* Preview */}
        {note.plainText && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">
            {note.plainText}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {format(note.updatedAt, "MMM d")}
          </span>
        </div>
      </div>
    </Link>
  );
}
