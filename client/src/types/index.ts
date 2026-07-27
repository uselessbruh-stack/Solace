import { JSONContent } from "@tiptap/react";

// ─── User ───────────────────────────────────────────
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  theme: ThemeKey;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  font: "inter" | "georgia" | "jetbrains";
  density: "compact" | "comfortable" | "spacious";
  animations: boolean;
}

// ─── Collection (Folder) ────────────────────────────
export interface Collection {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  parentId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Note ───────────────────────────────────────────
export interface Note {
  id: string;
  userId: string;
  collectionId: string | null;
  title: string;
  content: JSONContent | null;
  plainText: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  trashedAt: Date | null;
  coverImage: string | null;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteListItem {
  id: string;
  title: string;
  plainText: string;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  collectionId: string | null;
  trashedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

// ─── Music ──────────────────────────────────────────
export interface MusicTrack {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
}

// ─── Theme ──────────────────────────────────────────
export type ThemeKey =
  // Dark
  | "midnight"
  | "coffee"
  | "ocean"
  | "lavender"
  | "rosePine"
  | "emerald"
  | "gold"
  | "silver"
  | "cherry"
  // Light
  | "minimal"
  | "lavenderLight"
  | "roseLight"
  | "sand"
  | "sky"
  | "mint"
  | "peach"
  // Subtle
  | "slate"
  | "olive"
  | "parchment"
  | "fog";

export interface ThemeDefinition {
  key: ThemeKey;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarBorder: string;
    sidebarPrimary: string;
    sidebarAccent: string;
  };
}
