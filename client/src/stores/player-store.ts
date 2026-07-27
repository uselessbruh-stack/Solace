import { create } from "zustand";
import type { MusicTrack } from "@/types";

interface PlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setTrack: (track: MusicTrack | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,

  setTrack: (track) =>
    set({ currentTrack: track, isPlaying: !!track, currentTime: 0, duration: 0 }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  clear: () =>
    set({ currentTrack: null, isPlaying: false, currentTime: 0, duration: 0 }),
}));
