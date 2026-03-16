import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface TodoBodyProps {
  content: string;
  widgetId: string;
  onUpdate: (id: string, updates: { content: string }) => void;
  linkMode: boolean;
}

function parseTodos(content: string): TodoItem[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

let todoCounter = 0;

export default function TodoBody({ content, widgetId, onUpdate, linkMode }: TodoBodyProps) {
  const { t } = useLanguage();
  const [items, setItems] = useState<TodoItem[]>(() => parseTodos(content));
  const inputRef = useRef<HTMLInputElement>(null);

  const persist = useCallback(
    (updated: TodoItem[]) => {
      setItems(updated);
      onUpdate(widgetId, { content: JSON.stringify(updated) });
    },
    [widgetId, onUpdate]
  );

  const addItem = useCallback(() => {
    const text = inputRef.current?.value.trim();
    if (!text) return;
    const newItem: TodoItem = { id: `t_${Date.now()}_${todoCounter++}`, text, done: false };
    persist([...items, newItem]);
    if (inputRef.current) inputRef.current.value = "";
  }, [items, persist]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const toggleItem = useCallback(
    (id: string) => {
      persist(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
    },
    [items, persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id));
    },
    [items, persist]
  );

  return (
    <div className="p-3 flex-1 flex flex-col gap-1.5 min-h-[30px]">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
          <Checkbox
            checked={item.done}
            onCheckedChange={() => toggleItem(item.id)}
            disabled={linkMode}
            className="shrink-0"
          />
          <span
            className={`flex-1 text-sm leading-tight ${
              item.done ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {item.text}
          </span>
          {!linkMode && (
            <button
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.id);
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      {!linkMode && (
        <div className="flex items-center gap-1.5 mt-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={t("addTask")}
            className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <button
            className="text-muted-foreground hover:text-foreground p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              addItem();
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
