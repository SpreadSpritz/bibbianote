import { useRef, useCallback, useState, type PointerEvent, type MouseEvent } from "react";
import type { WidgetData } from "@/types/board";
import { Check, PackagePlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import TodoBody from "./TodoBody";
import MediaBody from "./MediaBody";

interface WidgetProps {
  widget: WidgetData;
  allWidgets: WidgetData[];
  scale: number;
  onUpdate: (id: string, updates: Partial<WidgetData>) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string, e: PointerEvent) => void;
  onResizeStart: (id: string, e: PointerEvent) => void;
  linkMode: boolean;
  onLinkClick: (id: string) => void;
  inRow?: boolean;
  selectedWidgetId?: string | null;
  onSelect?: (id: string) => void;
}

export default function Widget({
  widget,
  allWidgets,
  scale,
  onUpdate,
  onRemove,
  onDragStart,
  onResizeStart,
  linkMode,
  onLinkClick,
  inRow,
  selectedWidgetId,
  onSelect,
}: WidgetProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const isPanel = widget.type === "pannello_v" || widget.type === "pannello_o";
  const isInPanel = !!widget.parentId;

  const handleContentChange = useCallback(() => {
    if (bodyRef.current) {
      onUpdate(widget.id, { content: bodyRef.current.innerHTML });
    }
  }, [widget.id, onUpdate]);

  const handleClick = (e: MouseEvent) => {
    if (linkMode) {
      e.stopPropagation();
      onLinkClick(widget.id);
      return;
    }
    onSelect?.(widget.id);
    const target = e.target as HTMLElement;
    if (target.tagName === "A" && target.getAttribute("href")) {
      e.preventDefault();
      e.stopPropagation();
      window.open(target.getAttribute("href")!, "_blank", "noopener,noreferrer");
    }
  };


  return (
    <div
      data-widget-id={widget.id}
      className={`${isInPanel ? "relative" : "absolute"} rounded-xl flex flex-col widget-card ${
        isPanel
          ? "panel-widget border-2 border-border bg-card/80"
          : "bg-card"
      } ${linkMode ? "cursor-crosshair" : ""} ${selectedWidgetId === widget.id ? "ring-2 ring-primary/50" : ""}`}
      style={{
        ...(isInPanel
          ? {
              width: inRow ? (isPanel ? "auto" : (widget.width || 220)) : "auto",
              minWidth: 140,
              flexShrink: 0,
              flexGrow: inRow ? 0 : 1,
            }
          : {
              left: widget.x,
              top: widget.y,
              width: isPanel ? "auto" : widget.width,
              minWidth: isPanel ? 200 : undefined,
            }),
        minHeight: 60,
        height: isPanel ? "auto" : isInPanel ? "auto" : (widget.height || "auto"),
        backgroundColor: widget.color || undefined,
        zIndex: 1,
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <div
        className="h-7 bg-foreground/[0.035] rounded-t-xl flex items-center justify-between px-1.5 gap-1"
        style={{ cursor: linkMode ? "crosshair" : "grab", touchAction: "none" }}
        onPointerDown={(e) => {
          if (linkMode) return;
          e.stopPropagation();
          e.preventDefault();
          onDragStart(widget.id, e);
        }}
      >
        <div className="flex items-center gap-0.5">
        </div>

        <div className="flex-1 min-w-0 mx-1 pointer-events-none">
          {widget.title ? (
            <span className="text-[11px] text-muted-foreground truncate block">
              {widget.title}
            </span>
          ) : isPanel ? (
            <span className="text-[11px] uppercase text-muted-foreground/50">
              {widget.type === "pannello_v" ? t("column") : t("row")}
            </span>
          ) : null}
        </div>

        {/* Right side: drop zone icon for panels */}
        <div className="flex items-center gap-0.5">
          {isPanel && (
            <div
              data-drop-zone={widget.id}
              className="text-muted-foreground hover:text-primary p-0.5 transition-colors"
              title="Drop widget here"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PackagePlus size={14} strokeWidth={1.8} />
            </div>
          )}
        </div>

      </div>

      {/* Body */}
      {isPanel ? (
        <div
          ref={bodyRef}
          className={`p-3 flex-1 ${
            widget.type === "pannello_v"
              ? "flex flex-col gap-3"
              : "flex flex-row gap-3 overflow-x-auto"
          }`}
          style={{ minHeight: 60 }}
        >
          {(() => {
            const myChildren = allWidgets.filter((c) => c.parentId === widget.id);
            return myChildren.length > 0 ? (
              myChildren.map((child) => (
                <Widget
                  key={child.id}
                  widget={child}
                  allWidgets={allWidgets}
                  scale={scale}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onDragStart={onDragStart}
                  onResizeStart={onResizeStart}
                  linkMode={linkMode}
                  onLinkClick={onLinkClick}
                  inRow={widget.type === "pannello_o"}
                  selectedWidgetId={selectedWidgetId}
                  onSelect={onSelect}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-16 text-muted-foreground/50 text-sm pointer-events-none select-none">
                {widget.type === "pannello_v" ? "↕ Drop here" : "↔ Drop here"}
              </div>
            );
          })()}
        </div>
      ) : widget.type === "todo" ? (
        <TodoBody
          content={widget.content}
          widgetId={widget.id}
          onUpdate={onUpdate}
          linkMode={linkMode}
        />
      ) : widget.type === "foto" ? (
        <MediaBody
          content={widget.content}
          widgetId={widget.id}
          onUpdate={onUpdate}
          linkMode={linkMode}
        />
      ) : (
        <div
          ref={bodyRef}
          className="p-4 flex-1"
          contentEditable={!linkMode}
          suppressContentEditableWarning
          onBlur={handleContentChange}
          dangerouslySetInnerHTML={{ __html: widget.content || "" }}
          data-placeholder={t("writeHere")}
          style={{
            outline: "none",
            minHeight: 30,
            cursor: linkMode ? "crosshair" : "text",
            userSelect: linkMode ? "none" : "text",
          }}
        />
      )}

      {/* Resizer */}
      {!linkMode && !isInPanel && !isPanel && (
        <div
          className="absolute right-1.5 bottom-1.5 w-4 h-4 cursor-nwse-resize border-r-2 border-b-2 border-foreground/20 rounded-br-sm z-[100]"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onResizeStart(widget.id, e);
          }}
        />
      )}
    </div>
  );
}
