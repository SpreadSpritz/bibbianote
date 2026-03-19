import { useCallback, useEffect, useRef, useState, type PointerEvent, type DragEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardStore } from "@/hooks/useBoardStore";
import type { WidgetData } from "@/types/board";
import Toolbar from "./Toolbar";
import Widget from "./Widget";
import ArrowsLayer from "./ArrowsLayer";
import NavControls from "./NavControls";
import SelectionToolbar from "./SelectionToolbar";
import ConnectionToolbar from "./ConnectionToolbar";

let idCounter = 0;
const makeId = () => `w_${Date.now()}_${idCounter++}`;

export default function BoardCanvas() {
  const { user } = useAuth();
  const store = useBoardStore(user?.uid || null);
  const { board, save } = store;
  const vpRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{
    type: "pan" | "widget" | "resize";
    id?: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    wasInPanel?: boolean;
    moved?: boolean;
  } | null>(null);

  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<WidgetData["type"] | null>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) store.load();
  }, [user?.uid]);

  // Drop from desktop toolbar drag
  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("widget-type") as WidgetData["type"];
      if (!type) return;
      const boardX = (e.clientX - board.panX) / board.scale;
      const boardY = (e.clientY - board.panY) / board.scale;
      const id = makeId();
      const isPanel = type.startsWith("pannello");
      store.addWidget({
        id, type,
        x: boardX - 125, y: boardY - (isPanel ? 100 : 40),
        width: 250, height: isPanel ? 200 : 120,
        color: "", content: "", parentId: null, snap: isPanel,
      });
      save();
    },
    [board.panX, board.panY, board.scale, store, save]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // Tap-to-place or pan start
  const handleVpPointerDown = useCallback(
    (e: PointerEvent) => {
      if (linkMode) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-widget-id]")) return;

      // Deselect when clicking on empty canvas
      setSelectedWidgetId(null);
      setSelectedConnectionId(null);

      if (selectedTool) {
        const boardX = (e.clientX - board.panX) / board.scale;
        const boardY = (e.clientY - board.panY) / board.scale;
        const id = makeId();
        const isPanel = selectedTool.startsWith("pannello");
        store.addWidget({
          id, type: selectedTool,
          x: boardX - 125, y: boardY - (isPanel ? 100 : 40),
          width: 250, height: isPanel ? 200 : 120,
          color: "", content: "", parentId: null, snap: isPanel,
        });
        save();
        setSelectedTool(null);
        return;
      }

      dragRef.current = { type: "pan", startX: e.clientX, startY: e.clientY, initX: board.panX, initY: board.panY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [board.panX, board.panY, board.scale, linkMode, selectedTool, store, save]
  );

  // Widget drag start - works for both top-level and in-panel widgets
  const handleWidgetDragStart = useCallback(
    (id: string, e: PointerEvent) => {
      const w = board.widgets.find((w) => w.id === id);
      if (!w) return;

      // If widget is inside a panel, detach it first and compute absolute position
      if (w.parentId) {
        const el = document.querySelector(`[data-widget-id="${id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const absX = (rect.left - board.panX) / board.scale;
          const absY = (rect.top - board.panY) / board.scale;
          store.updateWidget(id, { parentId: null, x: absX, y: absY, width: rect.width / board.scale });
          dragRef.current = {
            type: "widget", id,
            startX: e.clientX, startY: e.clientY,
            initX: absX, initY: absY,
            wasInPanel: true, moved: false,
          };
        }
      } else {
        dragRef.current = {
          type: "widget", id,
          startX: e.clientX, startY: e.clientY,
          initX: w.x, initY: w.y,
          moved: false,
        };
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [board.widgets, board.panX, board.panY, board.scale, store]
  );

  const handleResizeStart = useCallback(
    (id: string, e: PointerEvent) => {
      const w = board.widgets.find((w) => w.id === id);
      if (!w) return;
      dragRef.current = { type: "resize", id, startX: e.clientX, startY: e.clientY, initX: w.width, initY: w.height };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [board.widgets]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        d.moved = true;
      }

      if (d.type === "pan") {
        store.setPan(d.initX + dx, d.initY + dy);
      } else if (d.type === "widget" && d.id) {
        store.updateWidget(d.id, {
          x: d.initX + dx / board.scale,
          y: d.initY + dy / board.scale,
        });

        // Highlight nearby drop zones
        const widgetEl = document.querySelector(`[data-widget-id="${d.id}"]`) as HTMLElement;
        const headerRect = widgetEl?.getBoundingClientRect();
        const dropZones = document.querySelectorAll("[data-drop-zone]");
        const threshold = 80 * board.scale;

        dropZones.forEach((zone) => {
          const panelId = zone.getAttribute("data-drop-zone")!;
          if (panelId === d.id) return;
          const zoneRect = zone.getBoundingClientRect();
          const dist = headerRect
            ? Math.hypot(
                zoneRect.left + zoneRect.width / 2 - (headerRect.left + headerRect.width / 2),
                zoneRect.top + zoneRect.height / 2 - (headerRect.top + headerRect.height / 2)
              )
            : Infinity;
          const el = zone as HTMLElement;
          if (dist < threshold) {
            el.style.transform = "scale(1.8)";
            el.style.color = "hsl(var(--primary))";
            el.style.transition = "transform 0.15s ease, color 0.15s ease";
          } else {
            el.style.transform = "";
            el.style.color = "";
            el.style.transition = "transform 0.15s ease, color 0.15s ease";
          }
        });
      } else if (d.type === "resize" && d.id) {
        store.updateWidget(d.id, {
          width: Math.max(160, d.initX + dx / board.scale),
          height: Math.max(70, d.initY + dy / board.scale),
        });
      }
    },
    [board.scale, store]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;

      // Reset all drop zone highlights
      document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
        const el = zone as HTMLElement;
        el.style.transform = "";
        el.style.color = "";
      });

      // Check if dragged widget should be dropped into a panel
      if (d.type === "widget" && d.id && d.moved) {
        const w = board.widgets.find((w) => w.id === d.id);
        if (w && !w.parentId) {
          const isDescendant = (parentId: string, targetId: string): boolean => {
            let cur = parentId;
            while (cur) {
              if (cur === targetId) return true;
              const p = board.widgets.find((w) => w.id === cur);
              cur = p?.parentId || "";
            }
            return false;
          };

          // Check if widget header overlaps any panel's drop zone icon
          const headerEl = document.querySelector(`[data-widget-id="${d.id}"]`)?.querySelector('[style*="grab"], [style*="crosshair"]') as HTMLElement;
          const widgetEl = document.querySelector(`[data-widget-id="${d.id}"]`) as HTMLElement;
          const headerRect = headerEl?.getBoundingClientRect() || widgetEl?.getBoundingClientRect();

          if (headerRect) {
            const dropZones = document.querySelectorAll("[data-drop-zone]");
            let bestPanel: WidgetData | null = null;
            let bestDist = Infinity;

            dropZones.forEach((zone) => {
              const panelId = zone.getAttribute("data-drop-zone")!;
              if (panelId === d.id || isDescendant(panelId, d.id!)) return;
              const panel = board.widgets.find((p) => p.id === panelId);
              if (!panel) return;

              const zoneRect = zone.getBoundingClientRect();
              const zoneCx = zoneRect.left + zoneRect.width / 2;
              const zoneCy = zoneRect.top + zoneRect.height / 2;
              const headerCx = headerRect.left + headerRect.width / 2;
              const headerCy = headerRect.top + headerRect.height / 2;
              const dist = Math.hypot(zoneCx - headerCx, zoneCy - headerCy);
              const threshold = 80 * board.scale;

              if (dist < threshold && dist < bestDist) {
                bestDist = dist;
                bestPanel = panel;
              }
            });

            if (bestPanel) {
              store.updateWidget(d.id!, { parentId: (bestPanel as WidgetData).id, x: 0, y: 0 });
            }
          }
        }
      }

      save();
    },
    [board.widgets, board.panX, board.panY, board.scale, store, save]
  );

  // Wheel zoom
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const px = (e.clientX - board.panX) / board.scale;
      const py = (e.clientY - board.panY) / board.scale;
      const factor = e.deltaY < 0 ? 1.05 : 0.95;
      const newScale = Math.min(Math.max(0.2, board.scale * factor), 3);
      store.setPan(e.clientX - px * newScale, e.clientY - py * newScale);
      store.setScale(newScale);
      save();
    };
    vp.addEventListener("wheel", handler, { passive: false });
    return () => vp.removeEventListener("wheel", handler);
  }, [board.panX, board.panY, board.scale, store, save]);

  // Pinch-to-zoom for mobile
  const pinchRef = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(null);

  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = {
          dist: Math.hypot(dx, dy),
          scale: board.scale,
          cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / pinchRef.current.dist;
        const newScale = Math.min(Math.max(0.2, pinchRef.current.scale * ratio), 3);
        const px = (pinchRef.current.cx - board.panX) / board.scale;
        const py = (pinchRef.current.cy - board.panY) / board.scale;
        store.setPan(pinchRef.current.cx - px * newScale, pinchRef.current.cy - py * newScale);
        store.setScale(newScale);
      }
    };

    const onTouchEnd = () => {
      if (pinchRef.current) {
        pinchRef.current = null;
        save();
      }
    };

    vp.addEventListener("touchstart", onTouchStart, { passive: false });
    vp.addEventListener("touchmove", onTouchMove, { passive: false });
    vp.addEventListener("touchend", onTouchEnd);
    return () => {
      vp.removeEventListener("touchstart", onTouchStart);
      vp.removeEventListener("touchmove", onTouchMove);
      vp.removeEventListener("touchend", onTouchEnd);
    };
  }, [board.panX, board.panY, board.scale, store, save]);

  const zoom = useCallback(
    (zoomIn: boolean) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const px = (cx - board.panX) / board.scale;
      const py = (cy - board.panY) / board.scale;
      const newScale = Math.min(Math.max(0.2, board.scale * (zoomIn ? 1.2 : 0.833)), 3);
      store.setPan(cx - px * newScale, cy - py * newScale);
      store.setScale(newScale);
      save();
    },
    [board.panX, board.panY, board.scale, store, save]
  );

  const recenter = useCallback(() => {
    store.setPan(window.innerWidth / 2, window.innerHeight / 2);
    store.setScale(1);
    save();
  }, [store, save]);

  const handleLinkClick = useCallback(
    (id: string) => {
      if (!linkSource) {
        setLinkSource(id);
      } else if (linkSource !== id) {
        store.addConnection({
          id: linkSource + "-" + id,
          sourceId: linkSource,
          targetId: id,
          offsetX: 0, offsetY: 0,
        });
        setLinkSource(null);
        setLinkMode(false);
        save();
      }
    },
    [linkSource, store, save]
  );

  return (
    <div className="fixed inset-0 touch-none">
      <Toolbar
        linkMode={linkMode}
        onToggleLinkMode={() => {
          setLinkMode(!linkMode);
          setLinkSource(null);
          setSelectedTool(null);
        }}
        selectedTool={selectedTool}
        onSelectTool={(type) => {
          setSelectedTool(type);
          if (type) { setLinkMode(false); setLinkSource(null); }
        }}
      />

      <div
        ref={vpRef}
        className={`absolute inset-0 board-viewport ${linkMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={handleVpPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          touchAction: "none",
          backgroundPosition: `${board.panX}px ${board.panY}px`,
          backgroundSize: `${30 * board.scale}px ${30 * board.scale}px`,
        }}
      >
        <div
          id="board-root"
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${board.panX}px, ${board.panY}px) scale(${board.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <ArrowsLayer
            connections={board.connections}
            widgets={board.widgets}
            scale={board.scale}
            panX={board.panX}
            panY={board.panY}
            onUpdateConnection={store.updateConnection}
            onRemoveConnection={store.removeConnection}
            onSave={save}
            selectedConnectionId={selectedConnectionId}
            onSelectConnection={(id) => {
              setSelectedConnectionId(id);
              setSelectedWidgetId(null);
            }}
          />
          {board.widgets
            .filter((w) => !w.parentId)
              .map((w) => (
                <Widget
                  key={w.id}
                  widget={w}
                  allWidgets={board.widgets}
                  scale={board.scale}
                  onUpdate={store.updateWidget}
                  onRemove={(id) => { store.removeWidget(id); save(); }}
                  onDragStart={handleWidgetDragStart}
                  onResizeStart={handleResizeStart}
                  linkMode={linkMode}
                  linkSourceId={linkSource}
                  onLinkClick={handleLinkClick}
                  selectedWidgetId={selectedWidgetId}
                  onSelect={setSelectedWidgetId}
                />
            ))}
        </div>
      </div>

      {selectedWidgetId && board.widgets.find(w => w.id === selectedWidgetId) && (
        <SelectionToolbar
          widget={board.widgets.find(w => w.id === selectedWidgetId)!}
          onUpdate={(id, updates) => { store.updateWidget(id, updates); save(); }}
          onRemove={(id) => { store.removeWidget(id); setSelectedWidgetId(null); save(); }}
        />
      )}

      <NavControls
        syncStatus={store.syncStatus}
        scale={board.scale}
        onZoomIn={() => zoom(true)}
        onZoomOut={() => zoom(false)}
        onRecenter={recenter}
      />
    </div>
  );
}
