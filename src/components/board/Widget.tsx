import { useRef, useCallback, useState, type PointerEvent, type MouseEvent } from "react";
import type { WidgetData } from "@/types/board";
import { X, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const COLORS = ["#ffffff", "#fff3cd", "#d1ecf1", "#f8d7da", "#d4edda", "#e2d5f1", "#fce4ec"];

interface WidgetProps {
  widget: WidgetData;
  scale: number;
  onUpdate: (id: string, updates: Partial<WidgetData>) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string, e: PointerEvent) => void;
  onResizeStart: (id: string, e: PointerEvent) => void;
  linkMode: boolean;
  onLinkClick: (id: string) => void;
}

export default function Widget({
  widget,
  scale,
  onUpdate,
  onRemove,
  onDragStart,
  onResizeStart,
  linkMode,
  onLinkClick,
}: WidgetProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState(false);

  const isPanel = widget.type === "pannello_v" || widget.type === "pannello_o";

  const handleContentChange = useCallback(() => {
    if (bodyRef.current) {
      onUpdate(widget.id, { content: bodyRef.current.innerHTML });
    }
  }, [widget.id, onUpdate]);

  const handleClick = (e: MouseEvent) => {
    if (linkMode) {
      e.stopPropagation();
      onLinkClick(widget.id);
    }
  };

  return (
    <div
      data-widget-id={widget.id}
      className={`absolute rounded-xl flex flex-col widget-card ${isPanel ? "panel-widget border border-border bg-card/80" : "bg-card"} ${linkMode ? "cursor-crosshair" : ""}`}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        minHeight: 80,
        height: widget.height || "auto",
        backgroundColor: widget.color || undefined,
        zIndex: 1,
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div
        className={`h-7 bg-foreground/[0.035] rounded-t-xl flex items-center justify-between px-2.5 ${isPanel ? "" : "widget-header"}`}
        style={{ cursor: linkMode ? "crosshair" : "grab" }}
        onPointerDown={(e) => {
          if (linkMode) return;
          e.stopPropagation();
          onDragStart(widget.id, e);
        }}
      >
        {isPanel && (
          <span className="text-[11px] uppercase text-muted-foreground pointer-events-none">
            {widget.type === "pannello_v" ? "Colonna" : "Riga"}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto relative">
          <button
            className="text-muted-foreground hover:text-foreground text-xs p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              setShowColors(!showColors);
            }}
          >
            <Palette size={12} />
          </button>
          <button
            className="text-muted-foreground hover:text-destructive text-xs p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(widget.id);
            }}
          >
            <X size={12} />
          </button>
          {showColors && (
            <div className="absolute top-7 right-0 bg-card p-1.5 rounded-lg shadow-lg flex gap-1 z-50">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(widget.id, { color: c });
                    setShowColors(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className={`p-4 flex-1 ${isPanel ? (widget.type === "pannello_v" ? "flex flex-col gap-4" : "flex flex-row gap-4 overflow-x-auto") : ""}`}
        contentEditable={!isPanel && !linkMode}
        suppressContentEditableWarning
        onBlur={handleContentChange}
        dangerouslySetInnerHTML={!isPanel ? { __html: widget.content || "" } : undefined}
        data-placeholder={widget.type === "nota" ? "Scrivi qui..." : widget.type === "todo" ? "Task list..." : ""}
        style={{
          outline: "none",
          minHeight: 30,
          cursor: isPanel ? "default" : linkMode ? "crosshair" : "text",
          userSelect: linkMode ? "none" : "text",
        }}
      />

      {/* Resizer */}
      {!linkMode && (
        <div
          className="absolute right-1.5 bottom-1.5 w-4 h-4 cursor-nwse-resize border-r-2 border-b-2 border-foreground/20 rounded-br-sm z-[100]"
          onPointerDown={(e) => {
            e.stopPropagation();
            onResizeStart(widget.id, e);
          }}
        />
      )}
    </div>
  );
}
