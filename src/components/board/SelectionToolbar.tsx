import { useState, useRef } from "react";
import { Trash2, Paintbrush, Type, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { WidgetData } from "@/types/board";

const COLORS = ["#ffffff", "#fff3cd", "#d1ecf1", "#f8d7da", "#d4edda", "#e2d5f1", "#fce4ec"];

interface SelectionToolbarProps {
  widget: WidgetData;
  onUpdate: (id: string, updates: Partial<WidgetData>) => void;
  onRemove: (id: string) => void;
}

export default function SelectionToolbar({ widget, onUpdate, onRemove }: SelectionToolbarProps) {
  const { t } = useLanguage();
  const [showColors, setShowColors] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(widget.title || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmTitle = () => {
    onUpdate(widget.id, { title: titleDraft });
    setEditingTitle(false);
  };

  const startEditing = () => {
    setTitleDraft(widget.title || "");
    setEditingTitle(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="fixed top-3 right-3 z-[9999] flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-2 py-1.5">
      <button
        className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
        title={t("delete") || "Delete"}
        onClick={() => onRemove(widget.id)}
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>

      <div className="relative">
        <button
          className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
          title={t("customize") || "Customize"}
          onClick={() => setShowColors(!showColors)}
        >
          <Paintbrush size={16} strokeWidth={2} />
        </button>
        {showColors && (
          <div className="absolute top-full right-0 mt-1 bg-card p-1.5 rounded-lg shadow-lg border border-border flex gap-1 z-50">
            {COLORS.map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                onClick={() => {
                  onUpdate(widget.id, { color: c });
                  setShowColors(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {editingTitle ? (
        <div className="flex items-center gap-1 ml-1">
          <input
            ref={inputRef}
            className="bg-transparent border-b border-primary/40 text-sm text-foreground outline-none w-24 px-1"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmTitle();
              if (e.key === "Escape") setEditingTitle(false);
            }}
          />
          <button
            className="text-primary hover:text-primary/80 p-1"
            onClick={confirmTitle}
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
          title={t("title") || "Title"}
          onClick={startEditing}
        >
          <Type size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
