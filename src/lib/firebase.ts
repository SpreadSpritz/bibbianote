import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDiEPIuYsuH-exYrCu4Sw1OigAJ2iZb_0c",
  authDomain: "punti-diritto.firebaseapp.com",
  databaseURL: "https://punti-diritto-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "punti-diritto",
  storageBucket: "punti-diritto.firebasestorage.app",
  messagingSenderId: "718743082670",
  appId: "1:718743082670:web:d8c182b4ac46b5b8783f3f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

/**
 * Convert a username to a fake email for Firebase Auth.
 * If the user typed a real email, keep it as is.
 */
export function usernameToEmail(username: string): string {
  const trimmed = username.trim();
  if (trimmed.includes("@")) return trimmed;
  return trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, "") + "@punti-diritto.app";
}
