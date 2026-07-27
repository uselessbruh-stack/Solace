import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile } from "./firestore";

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  // Create the Firebase Auth user
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Set display name (non-blocking)
  updateProfile(credential.user, { displayName: name }).catch((err) =>
    console.warn("Failed to set display name:", err)
  );

  // Create Firestore profile (non-blocking — don't let this prevent login)
  createUserProfile(credential.user.uid, {
    displayName: name,
    email,
  }).catch((err) => console.warn("Failed to create user profile:", err));

  return credential.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}