"use client";

import { useEffect, useState, useCallback } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getNotes, toggleNoteFavorite } from "@/lib/firestore";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import type { NoteListItem } from "@/types";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getNotes(user.uid, { favoritesOnly: true });
      setNotes(data);
    } catch {
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleToggleFavorite = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await toggleNoteFavorite(id, note.favorite);
    } catch {
      setNotes((prev) => [...prev, note]);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Favorites</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Your starred notes</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites" description="Star notes to find them here." />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
