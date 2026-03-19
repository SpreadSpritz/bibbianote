import { Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConnectionToolbarProps {
  onRemove: () => void;
}

export default function ConnectionToolbar({ onRemove }: ConnectionToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed top-3 right-3 z-[9999] flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-2 py-1.5">
      <button
        className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
        title={t("delete") || "Delete"}
        onClick={onRemove}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
