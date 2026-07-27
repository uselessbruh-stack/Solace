import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  UserPreferences,
  Collection as CollectionType,
  Note,
  NoteListItem,
  ThemeKey,
} from "@/types";
import type { JSONContent } from "@tiptap/react";

// ─── Helpers ────────────────────────────────────────

function toDate(ts: Timestamp | Date | undefined): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date();
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

// ─── Users ──────────────────────────────────────────

const usersCol = () => collection(db, "users");

export async function createUserProfile(
  uid: string,
  data: { displayName: string; email: string }
) {
  const ref = doc(usersCol(), uid);
  await setDoc(ref, {
    displayName: data.displayName,
    email: data.email,
    avatar: null,
    bio: null,
    theme: "midnight" as ThemeKey,
    preferences: {
      font: "inter",
      density: "comfortable",
      animations: true,
    } satisfies UserPreferences,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(usersCol(), uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: snap.id,
    displayName: d.displayName,
    email: d.email,
    avatar: d.avatar ?? null,
    bio: d.bio ?? null,
    theme: d.theme ?? "midnight",
    preferences: d.preferences ?? {
      font: "inter",
      density: "comfortable",
      animations: true,
    },
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "avatar" | "bio" | "theme" | "preferences">>
) {
  const ref = doc(usersCol(), uid);
  await updateDoc(ref, {
    ...stripUndefined(data as Record<string, unknown>),
    updatedAt: serverTimestamp(),
  });
}

// ─── Collections (Folders) ──────────────────────────

const collectionsCol = () => collection(db, "collections");

export async function createCollection(data: {
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
}): Promise<string> {
  const ref = doc(collectionsCol());
  await setDoc(ref, {
    userId: data.userId,
    name: data.name,
    icon: data.icon ?? "📁",
    color: data.color ?? "#7c3aed",
    parentId: data.parentId ?? null,
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCollections(userId: string): Promise<CollectionType[]> {
  const q = query(
    collectionsCol(),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      name: data.name,
      icon: data.icon ?? "📁",
      color: data.color ?? "#737373",
      parentId: data.parentId ?? null,
      order: data.order ?? 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  });
  // Sort client-side
  results.sort((a, b) => a.order - b.order);
  return results;
}

export async function updateCollection(
  id: string,
  data: Partial<Pick<CollectionType, "name" | "icon" | "color" | "parentId" | "order">>
) {
  const ref = doc(collectionsCol(), id);
  await updateDoc(ref, {
    ...stripUndefined(data as Record<string, unknown>),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCollection(id: string) {
  const ref = doc(collectionsCol(), id);
  await deleteDoc(ref);
}

// ─── Notes ──────────────────────────────────────────

const notesCol = () => collection(db, "notes");

export async function createNote(data: {
  userId: string;
  collectionId?: string | null;
  title?: string;
}): Promise<string> {
  const ref = doc(notesCol());
  await setDoc(ref, {
    userId: data.userId,
    collectionId: data.collectionId ?? null,
    title: data.title ?? "Untitled",
    content: null,
    plainText: "",
    tags: [],
    pinned: false,
    favorite: false,
    archived: false,
    trashedAt: null,
    coverImage: null,
    wordCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getNotes(
  userId: string,
  opts?: { collectionId?: string; favoritesOnly?: boolean; trashedOnly?: boolean; limit?: number }
): Promise<NoteListItem[]> {
  // Simple single-field query — no composite index needed
  const q = query(
    notesCol(),
    where("userId", "==", userId)
  );

  const snap = await getDocs(q);

  let results = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "Untitled",
      plainText: (data.plainText ?? "").slice(0, 200),
      tags: data.tags ?? [],
      pinned: data.pinned ?? false,
      favorite: data.favorite ?? false,
      collectionId: data.collectionId ?? null,
      trashedAt: data.trashedAt ? toDate(data.trashedAt) : null,
      updatedAt: toDate(data.updatedAt),
      createdAt: toDate(data.createdAt),
    };
  });

  // Client-side filtering
  if (opts?.trashedOnly) {
    results = results.filter((n) => n.trashedAt !== null);
  } else {
    results = results.filter((n) => n.trashedAt === null);
  }

  if (opts?.collectionId) {
    results = results.filter((n) => n.collectionId === opts.collectionId);
  }

  if (opts?.favoritesOnly) {
    results = results.filter((n) => n.favorite);
  }

  // Sort by updatedAt descending
  results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  if (opts?.limit) {
    results = results.slice(0, opts.limit);
  }

  return results;
}

export async function getNote(noteId: string): Promise<Note | null> {
  const ref = doc(notesCol(), noteId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.userId,
    collectionId: d.collectionId ?? null,
    title: d.title ?? "Untitled",
    content: d.content ?? null,
    plainText: d.plainText ?? "",
    tags: d.tags ?? [],
    pinned: d.pinned ?? false,
    favorite: d.favorite ?? false,
    archived: d.archived ?? false,
    trashedAt: d.trashedAt ? toDate(d.trashedAt) : null,
    coverImage: d.coverImage ?? null,
    wordCount: d.wordCount ?? 0,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export async function updateNote(
  noteId: string,
  data: {
    title?: string;
    content?: JSONContent | null;
    plainText?: string;
    tags?: string[];
    collectionId?: string | null;
    pinned?: boolean;
    favorite?: boolean;
    archived?: boolean;
    coverImage?: string | null;
    wordCount?: number;
  }
) {
  const ref = doc(notesCol(), noteId);
  await updateDoc(ref, {
    ...stripUndefined(data as Record<string, unknown>),
    updatedAt: serverTimestamp(),
  });
}

export async function softDeleteNote(noteId: string) {
  const ref = doc(notesCol(), noteId);
  await updateDoc(ref, {
    trashedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreNote(noteId: string) {
  const ref = doc(notesCol(), noteId);
  await updateDoc(ref, {
    trashedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function permanentDeleteNote(noteId: string) {
  const ref = doc(notesCol(), noteId);
  await deleteDoc(ref);
}

export async function toggleNoteFavorite(noteId: string, current: boolean) {
  const ref = doc(notesCol(), noteId);
  await updateDoc(ref, {
    favorite: !current,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleNotePin(noteId: string, current: boolean) {
  const ref = doc(notesCol(), noteId);
  await updateDoc(ref, {
    pinned: !current,
    updatedAt: serverTimestamp(),
  });
}
