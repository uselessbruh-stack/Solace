"use client";

import { useState, useCallback, useRef } from "react";
import {
  Music,
  Search,
  X,
  Loader2,
  Plus,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MUSIC_SERVER =
  process.env.NEXT_PUBLIC_MUSIC_SERVER_URL || "http://localhost:4000";

interface MusicResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
}

interface MusicSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (track: MusicResult) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicSearchDialog({
  open,
  onClose,
  onInsert,
}: MusicSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedIndex(-1);
    try {
      const res = await fetch(
        `${MUSIC_SERVER}/api/music/search?q=${encodeURIComponent(query.trim())}&limit=8`
      );

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Music search error:", err);
      toast.error("Failed to search. Make sure the music server is running.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleSelect = (track: MusicResult) => {
    onInsert(track);
    handleClose();
    toast.success(`Added "${track.title}"`);
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setSelectedIndex(-1);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Add Music</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search for a song or artist..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm pl-8"
                autoFocus
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              size="sm"
              className="h-8 text-xs"
            >
              {isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Music className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                {hasSearched
                  ? "No results found. Try a different search."
                  : "Search for a song to add to your note."}
              </p>
            </div>
          ) : (
            <div className="p-1.5">
              {results.map((track, index) => (
                <button
                  key={track.videoId}
                  onClick={() => handleSelect(track)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-colors text-left ${
                    index === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  {/* Music icon (no cover image) */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary flex-shrink-0">
                    <Music className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Duration + Add */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {track.duration > 0 && (
                      <span className="text-[11px] text-muted-foreground tabular-nums flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(track.duration)}
                      </span>
                    )}
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              ))}

              <p className="text-[10px] text-muted-foreground text-center mt-2 pb-1">
                Press Enter to add selected · ↑↓ to navigate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
