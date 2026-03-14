
import { useAuth } from "@/contexts/AuthContext";

interface NavControlsProps {
  syncStatus: "offline" | "syncing" | "saved" | "error";
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export default function NavControls({ syncStatus, scale, onZoomIn, onZoomOut, onRecenter }: NavControlsProps) {
  const { logout } = useAuth();
  const statusMap = {
    offline: { icon: "🔴", text: "Assente" },
    syncing: { icon: "⏳", text: "Salvataggio..." },
    saved: { icon: "🟢", text: "Salvato" },
    error: { icon: "⚠️", text: "Errore" },
  };
  const s = statusMap[syncStatus];

  return (
    <div className="fixed right-6 bottom-6 z-[1001] flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-xl shadow-lg text-sm text-muted-foreground">
      <span className="border-r border-border pr-2 font-medium">
        {s.icon} {s.text}
      </span>
      <button onClick={logout} className="text-xs text-destructive font-semibold border-r border-border pr-2">
        Log Out
      </button>
      <button onClick={onRecenter} className="text-xs text-muted-foreground">Reset</button>
      <button onClick={onZoomOut} className="text-base">-</button>
      <span className="w-11 text-center font-semibold">{Math.round(scale * 100)}%</span>
      <button onClick={onZoomIn} className="text-base">+</button>
    </div>
  );
}
