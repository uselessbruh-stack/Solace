"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Pin,
  Trash2,
  Cloud,
  CloudOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getNote, softDeleteNote, toggleNoteFavorite, toggleNotePin } from "@/lib/firestore";
import { useNoteStore } from "@/stores/note-store";
import { useAutoSave } from "@/hooks/useAutoSave";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { TagInput } from "@/components/TagInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { JSONContent } from "@tiptap/react";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const noteId = params.id as string;

  const { currentNote, setCurrentNote, updateContent, isSaving, lastSavedAt } =
    useNoteStore();
  const { debouncedSave } = useAutoSave(noteId);

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");

  useEffect(() => {
    async function load() {
      if (!noteId) return;
      setIsLoading(true);
      try {
        const note = await getNote(noteId);
        if (!note) {
          toast.error("Note not found");
          router.push("/dashboard");
          return;
        }
        setCurrentNote(note);
        setTitle(note.title);
      } catch (err) {
        console.error("Failed to load note:", err);
        toast.error("Failed to load note");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => setCurrentNote(null);
  }, [noteId, router, setCurrentNote]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      debouncedSave({ title: newTitle });
    },
    [debouncedSave]
  );

  const handleContentUpdate = useCallback(
    (content: JSONContent, plainText: string, wordCount: number) => {
      updateContent(content, plainText, wordCount);
      debouncedSave({ content, plainText, wordCount });
    },
    [debouncedSave, updateContent]
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      debouncedSave({ tags });
    },
    [debouncedSave]
  );

  const handleFavorite = async () => {
    if (!currentNote) return;
    await toggleNoteFavorite(noteId, currentNote.favorite);
    setCurrentNote({ ...currentNote, favorite: !currentNote.favorite });
  };

  const handlePin = async () => {
    if (!currentNote) return;
    await toggleNotePin(noteId, currentNote.pinned);
    setCurrentNote({ ...currentNote, pinned: !currentNote.pinned });
  };

  const handleDelete = async () => {
    await softDeleteNote(noteId);
    toast.success("Moved to trash");
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentNote) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="gap-1 text-muted-foreground text-xs h-7"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>

        <div className="flex items-center gap-0.5">
          <div className="flex items-center gap-1 mr-2 text-[11px] text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving</span>
              </>
            ) : lastSavedAt ? (
              <>
                <Cloud className="h-3 w-3" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <CloudOff className="h-3 w-3" />
                <span>Not saved</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePin}
          >
            <Pin
              className={cn(
                "h-3.5 w-3.5",
                currentNote.pinned ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleFavorite}
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5",
                currentNote.favorite ? "fill-current text-foreground" : "text-muted-foreground"
              )}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="w-full text-2xl lg:text-3xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 mb-2 tracking-tight"
      />

      {/* Tags */}
      <div className="mb-5">
        <TagInput tags={currentNote.tags} onChange={handleTagsChange} />
      </div>

      {/* Editor */}
      <div className="min-h-[60vh]">
        <NoteEditor
          content={currentNote.content}
          onUpdate={handleContentUpdate}
        />
      </div>

      {/* Word count */}
      <div className="mt-6 pt-3 border-t border-border text-[11px] text-muted-foreground">
        {currentNote.wordCount} words
      </div>
    </div>
  );
}
