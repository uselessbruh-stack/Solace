"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Memory } from "@/types";
import Image from "next/image";
import { format } from "date-fns";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Memory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.memories ?? []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search memories..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9 bg-secondary/50 border-border/50"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-popover shadow-2xl z-50 overflow-hidden">
          {results.length === 0 && !isLoading ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No memories found
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((memory) => (
                <li key={memory._id}>
                  <button
                    className="flex w-full items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                    onClick={() => {
                      router.push(`/memory/${memory._id}`);
                      setIsOpen(false);
                      setQuery("");
                    }}
                  >
                    {memory.photos[0] && (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={memory.photos[0].url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {memory.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(memory.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
