import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavControlsProps {
  syncStatus: "offline" | "syncing" | "saved" | "error";
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export default function NavControls({ syncStatus, scale, onZoomIn, onZoomOut, onRecenter }: NavControlsProps) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const statusMap = {
    offline: { icon: "🔴", text: t("offline") },
    syncing: { icon: "⏳", text: t("syncing") },
    saved: { icon: "🟢", text: t("saved") },
    error: { icon: "⚠️", text: t("error") },
  };
  const s = statusMap[syncStatus];

  return (
    <div className="fixed right-6 bottom-6 z-[1001] flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-xl shadow-lg text-sm text-muted-foreground">
      <span className="border-r border-border pr-2 font-medium">
        {s.icon} {s.text}
      </span>
      <button onClick={logout} className="text-xs text-destructive font-semibold border-r border-border pr-2">
        {t("logout")}
      </button>
      <button onClick={onRecenter} className="text-xs text-muted-foreground">{t("reset")}</button>
      <button onClick={onZoomOut} className="text-base">-</button>
      <span className="w-11 text-center font-semibold">{Math.round(scale * 100)}%</span>
      <button onClick={onZoomIn} className="text-base">+</button>
    </div>
  );
}
