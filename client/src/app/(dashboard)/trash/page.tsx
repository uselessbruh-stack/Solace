"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RotateCcw, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getNotes, restoreNote, permanentDeleteNote } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { format } from "date-fns";
import type { NoteListItem } from "@/types";

export default function TrashPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrashed = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getNotes(user.uid, { trashedOnly: true });
      setNotes(data);
    } catch {
      toast.error("Failed to load trash");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrashed();
  }, [fetchTrashed]);

  const handleRestore = async (id: string) => {
    try {
      await restoreNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note restored");
    } catch {
      toast.error("Failed to restore");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await permanentDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Permanently deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Trash</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Deleted notes</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState icon={Trash2} title="Trash is empty" description="Deleted notes will appear here." />
      ) : (
        <div className="space-y-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors group"
            >
              <div className="min-w-0 flex-1 mr-3">
                <h3 className="text-sm font-medium truncate">{note.title || "Untitled"}</h3>
                <p className="text-[11px] text-muted-foreground">{format(note.updatedAt, "MMM d, yyyy")}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="gap-1 text-[11px] h-7" onClick={() => handleRestore(note.id)}>
                  <RotateCcw className="h-3 w-3" />
                  Restore
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-[11px] h-7 text-destructive hover:text-destructive" onClick={() => handlePermanentDelete(note.id)}>
                  <XCircle className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
