import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthOverlay() {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAction = async (action: "login" | "register") => {
    if (!username || !password) return;
    setError("");
    setBusy(true);
    try {
      if (action === "login") await login(username, password);
      else await register(username, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-background">
      <div className="bg-card rounded-xl shadow-lg p-8 w-[90%] max-w-[380px] text-center">
        <h2 className="text-xl font-semibold text-foreground mb-6">My Cloud Board</h2>

        {error && (
          <p className="text-destructive text-sm font-semibold mb-3">{error}</p>
        )}

        <input
          type="text"
          placeholder="Digita un Username personale"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3.5 mb-3 border-2 border-border rounded-lg bg-secondary text-foreground text-[15px] outline-none transition-colors focus:border-primary focus:bg-card"
        />
        <input
          type="password"
          placeholder="La tua password sicura"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3.5 mb-3 border-2 border-border rounded-lg bg-secondary text-foreground text-[15px] outline-none transition-colors focus:border-primary focus:bg-card"
        />

        <button
          onClick={() => handleAction("login")}
          disabled={busy}
          className="w-full p-3.5 mb-3 bg-primary text-primary-foreground font-semibold rounded-lg text-[15px] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Accedi al Tuo Profilo / Note
        </button>
        <button
          onClick={() => handleAction("register")}
          disabled={busy}
          className="w-full p-3.5 bg-secondary text-primary font-semibold rounded-lg text-[15px] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          Crea Nuova Utenza 👤
        </button>
      </div>
    </div>
  );
}
