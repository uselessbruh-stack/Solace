"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Clock, Pin, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getNotes, createNote, toggleNoteFavorite } from "@/lib/firestore";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { NoteListItem } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getNotes(user.uid);
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleNewNote = async () => {
    if (!user) return;
    try {
      const noteId = await createNote({ userId: user.uid });
      router.push(`/note/${noteId}`);
    } catch (err) {
      console.error("Failed to create note:", err);
      toast.error("Failed to create note");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n))
    );

    try {
      await toggleNoteFavorite(id, note.favorite);
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, favorite: note.favorite } : n))
      );
    }
  };

  const pinnedNotes = notes.filter((n) => n.pinned);
  const recentNotes = notes.filter((n) => !n.pinned);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <h1 className="text-lg font-semibold">
            {user?.displayName
              ? `Hey, ${user.displayName.split(" ")[0]}`
              : "Welcome"}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <Button onClick={handleNewNote} size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New note
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Create your first note to get started."
          actionLabel="Create note"
          onAction={handleNewNote}
        />
      ) : (
        <div className="space-y-6">
          {pinnedNotes.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5 mb-3">
                <Pin className="h-3 w-3 text-muted-foreground" />
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pinned
                </h2>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent
              </h2>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
