import { useCallback, useRef } from "react";
import { updateNote } from "@/lib/firestore";
import { useNoteStore } from "@/stores/note-store";
import { useDebounce } from "./useDebounce";
import type { JSONContent } from "@tiptap/react";

export function useAutoSave(noteId: string | null, delay = 1500) {
  const { setSaving, setLastSavedAt } = useNoteStore();
  const isSavingRef = useRef(false);

  const save = useCallback(
    async (data: {
      title?: string;
      content?: JSONContent | null;
      plainText?: string;
      wordCount?: number;
      tags?: string[];
    }) => {
      if (!noteId || isSavingRef.current) return;

      isSavingRef.current = true;
      setSaving(true);

      try {
        await updateNote(noteId, data);
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        isSavingRef.current = false;
        setSaving(false);
      }
    },
    [noteId, setSaving, setLastSavedAt]
  );

  const debouncedSave = useDebounce(save, delay);

  return { save, debouncedSave };
}
