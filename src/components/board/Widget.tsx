import { useRef, useCallback, useState, type PointerEvent, type MouseEvent, type DragEvent } from "react";
import type { WidgetData } from "@/types/board";
import { X, Palette, Link } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const COLORS = ["#ffffff", "#fff3cd", "#d1ecf1", "#f8d7da", "#d4edda", "#e2d5f1", "#fce4ec"];

interface WidgetProps {
  widget: WidgetData;
  children?: WidgetData[];
  scale: number;
  onUpdate: (id: string, updates: Partial<WidgetData>) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string, e: PointerEvent) => void;
  onResizeStart: (id: string, e: PointerEvent) => void;
  linkMode: boolean;
  onLinkClick: (id: string) => void;
  onDropIntoPanel?: (panelId: string, widgetType: WidgetData["type"], e: DragEvent) => void;
  onWidgetDropIntoPanel?: (panelId: string, widgetId: string) => void;
}

export default function Widget({
  widget,
  children,
  scale,
  onUpdate,
  onRemove,
  onDragStart,
  onResizeStart,
  linkMode,
  onLinkClick,
  onDropIntoPanel,
  onWidgetDropIntoPanel,
}: WidgetProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { t } = useLanguage();

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
      return;
    }
    const target = e.target as HTMLElement;
    if (target.tagName === "A" && target.getAttribute("href")) {
      e.preventDefault();
      e.stopPropagation();
      window.open(target.getAttribute("href")!, "_blank", "noopener,noreferrer");
    }
  };

  const insertLink = useCallback(() => {
    const url = prompt("URL:");
    if (!url) return;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return;
    }
    const finalUrl = url.startsWith("http") ? url : `https://${url}`;
    const selection = window.getSelection();
    const selectedText = selection?.toString() || finalUrl;

    if (bodyRef.current) {
      bodyRef.current.focus();
      const anchor = `<a href="${finalUrl}" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
      document.execCommand("insertHTML", false, anchor);
      handleContentChange();
    }
  }, [handleContentChange]);

  // Panel drop handling
  const handlePanelDragOver = useCallback((e: DragEvent) => {
    if (!isPanel) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }, [isPanel]);

  const handlePanelDragLeave = useCallback((e: DragEvent) => {
    if (!isPanel) return;
    e.stopPropagation();
    setDragOver(false);
  }, [isPanel]);

  const handlePanelDrop = useCallback((e: DragEvent) => {
    if (!isPanel) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const widgetType = e.dataTransfer.getData("widget-type") as WidgetData["type"];
    const existingWidgetId = e.dataTransfer.getData("widget-id");

    if (existingWidgetId && onWidgetDropIntoPanel) {
      onWidgetDropIntoPanel(widget.id, existingWidgetId);
    } else if (widgetType && onDropIntoPanel) {
      onDropIntoPanel(widget.id, widgetType, e);
    }
  }, [isPanel, widget.id, onDropIntoPanel, onWidgetDropIntoPanel]);

  // For child widgets inside panels - make them draggable via HTML drag
  const handleChildDragStart = useCallback((childId: string, e: DragEvent) => {
    e.dataTransfer.setData("widget-id", childId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const isInPanel = !!widget.parentId;

  return (
    <div
      data-widget-id={widget.id}
      draggable={isInPanel}
      onDragStart={isInPanel ? (e: DragEvent) => handleChildDragStart(widget.id, e as any) : undefined}
      className={`${isInPanel ? "relative" : "absolute"} rounded-xl flex flex-col widget-card ${isPanel ? `panel-widget border-2 ${dragOver ? "border-primary bg-primary/5" : "border-border bg-card/80"}` : "bg-card"} ${linkMode ? "cursor-crosshair" : ""} ${isInPanel ? "cursor-grab" : ""}`}
      style={{
        ...(isInPanel
          ? { width: widget.type === "pannello_o" ? undefined : "100%", minWidth: isInPanel ? 160 : undefined, flexShrink: 0 }
          : { left: widget.x, top: widget.y, width: widget.width }),
        minHeight: 80,
        height: isInPanel ? "auto" : (widget.height || "auto"),
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
          if (linkMode || isInPanel) return;
          e.stopPropagation();
          onDragStart(widget.id, e);
        }}
      >
        {isPanel && (
          <span className="text-[11px] uppercase text-muted-foreground pointer-events-none">
            {widget.type === "pannello_v" ? t("column") : t("row")}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto relative">
          {!isPanel && (
            <button
              className="text-muted-foreground hover:text-foreground text-xs p-0.5"
              title="Insert link"
              onClick={(e) => {
                e.stopPropagation();
                insertLink();
              }}
            >
              <Link size={12} />
            </button>
          )}
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
      {isPanel ? (
        <div
          ref={bodyRef}
          className={`p-3 flex-1 ${widget.type === "pannello_v" ? "flex flex-col gap-3" : "flex flex-row gap-3 overflow-x-auto"}`}
          onDragOver={handlePanelDragOver}
          onDragLeave={handlePanelDragLeave}
          onDrop={handlePanelDrop}
          style={{ minHeight: 60 }}
        >
          {children && children.length > 0 ? (
            children.map((child) => (
              <Widget
                key={child.id}
                widget={child}
                scale={scale}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onDragStart={onDragStart}
                onResizeStart={onResizeStart}
                linkMode={linkMode}
                onLinkClick={onLinkClick}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm pointer-events-none select-none">
              {widget.type === "pannello_v" ? "↕ Drop here" : "↔ Drop here"}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={bodyRef}
          className="p-4 flex-1"
          contentEditable={!linkMode}
          suppressContentEditableWarning
          onBlur={handleContentChange}
          dangerouslySetInnerHTML={{ __html: widget.content || "" }}
          data-placeholder={widget.type === "nota" ? t("writeHere") : widget.type === "todo" ? t("taskList") : ""}
          style={{
            outline: "none",
            minHeight: 30,
            cursor: linkMode ? "crosshair" : "text",
            userSelect: linkMode ? "none" : "text",
          }}
        />
      )}

      {/* Resizer */}
      {!linkMode && !isInPanel && (
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
