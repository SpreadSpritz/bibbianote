import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth, usernameToEmail } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

function getErrorMessage(error: any): string {
  const msg = error?.message?.toLowerCase() || "";
  if (msg.includes("invalid-credential") || msg.includes("user-not-found") || msg.includes("wrong"))
    return "❌ Username o password errati!";
  if (msg.includes("already-in-use"))
    return "👤 Questo username esiste già! Usa il tasto di accesso.";
  if (msg.includes("weak"))
    return "🔑 Password troppo debole. Minimo 6 caratteri.";
  return "Connessione fallita: " + msg;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    } catch (e: any) {
      throw new Error(getErrorMessage(e));
    }
  };

  const register = async (username: string, password: string) => {
    if (password.length < 6) throw new Error("🔑 Password minimo 6 caratteri.");
    try {
      await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
    } catch (e: any) {
      throw new Error(getErrorMessage(e));
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
