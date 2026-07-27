import { create } from "zustand";
import type { Note } from "@/types";
import type { JSONContent } from "@tiptap/react";

interface NoteStore {
  currentNote: Note | null;
  isSaving: boolean;
  lastSavedAt: Date | null;
  setCurrentNote: (note: Note | null) => void;
  updateCurrentNote: (updates: Partial<Note>) => void;
  updateContent: (content: JSONContent, plainText: string, wordCount: number) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  currentNote: null,
  isSaving: false,
  lastSavedAt: null,

  setCurrentNote: (note) => set({ currentNote: note, lastSavedAt: null }),

  updateCurrentNote: (updates) =>
    set((state) => ({
      currentNote: state.currentNote
        ? { ...state.currentNote, ...updates }
        : null,
    })),

  updateContent: (content, plainText, wordCount) =>
    set((state) => ({
      currentNote: state.currentNote
        ? { ...state.currentNote, content, plainText, wordCount }
        : null,
    })),

  setSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
}));
