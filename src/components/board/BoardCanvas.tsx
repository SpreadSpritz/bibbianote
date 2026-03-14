import { useCallback, useEffect, useRef, useState, type PointerEvent, type DragEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardStore } from "@/hooks/useBoardStore";
import type { WidgetData } from "@/types/board";
import Toolbar from "./Toolbar";
import Widget from "./Widget";
import ArrowsLayer from "./ArrowsLayer";
import NavControls from "./NavControls";

let idCounter = 0;
const makeId = () => `w_${Date.now()}_${idCounter++}`;

export default function BoardCanvas() {
  const { user } = useAuth();
  const store = useBoardStore(user?.uid || null);
  const { board, save } = store;
  const vpRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragRef = useRef<{
    type: "pan" | "widget" | "resize";
    id?: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<string | null>(null);

  // Load board on mount
  useEffect(() => {
    if (user?.uid) store.load();
  }, [user?.uid]);

  // Drop handler for drag-and-drop from toolbar
  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("widget-type") as WidgetData["type"];
      if (!type) return;

      const boardX = (e.clientX - board.panX) / board.scale;
      const boardY = (e.clientY - board.panY) / board.scale;
      const id = `w_${Date.now()}_${idCounter++}`;
      const isPanel = type.startsWith("pannello");

      store.addWidget({
        id,
        type,
        x: boardX - 125,
        y: boardY - (isPanel ? 100 : 40),
        width: 250,
        height: isPanel ? 200 : 120,
        color: "",
        content: "",
        parentId: null,
        snap: isPanel,
      });
      save();
    },
    [board.panX, board.panY, board.scale, store, save]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // Pan start on viewport
  const handleVpPointerDown = useCallback(
    (e: PointerEvent) => {
      if (linkMode) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-widget-id]")) return;
      dragRef.current = { type: "pan", startX: e.clientX, startY: e.clientY, initX: board.panX, initY: board.panY };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [board.panX, board.panY, linkMode]
  );

  // Widget drag start
  const handleWidgetDragStart = useCallback(
    (id: string, e: PointerEvent) => {
      const w = board.widgets.find((w) => w.id === id);
      if (!w) return;
      dragRef.current = { type: "widget", id, startX: e.clientX, startY: e.clientY, initX: w.x, initY: w.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [board.widgets]
  );

  // Resize start
  const handleResizeStart = useCallback(
    (id: string, e: PointerEvent) => {
      const w = board.widgets.find((w) => w.id === id);
      if (!w) return;
      dragRef.current = { type: "resize", id, startX: e.clientX, startY: e.clientY, initX: w.width, initY: w.height };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [board.widgets]
  );

  // Pointer move
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (d.type === "pan") {
        store.setPan(d.initX + dx, d.initY + dy);
      } else if (d.type === "widget" && d.id) {
        store.updateWidget(d.id, {
          x: d.initX + dx / board.scale,
          y: d.initY + dy / board.scale,
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

  const handlePointerUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
      save();
    }
  }, [save]);

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

  // Zoom buttons
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

  // Link mode
  const handleLinkClick = useCallback(
    (id: string) => {
      if (!linkSource) {
        setLinkSource(id);
      } else if (linkSource !== id) {
        store.addConnection({
          id: linkSource + "-" + id,
          sourceId: linkSource,
          targetId: id,
          offsetX: 0,
          offsetY: 0,
        });
        setLinkSource(null);
        setLinkMode(false);
        save();
      }
    },
    [linkSource, store, save]
  );

  return (
    <div className="fixed inset-0">
      <Toolbar
        linkMode={linkMode}
        onToggleLinkMode={() => {
          setLinkMode(!linkMode);
          setLinkSource(null);
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
          />
          {board.widgets
            .filter((w) => !w.parentId)
            .map((w) => (
              <Widget
                key={w.id}
                widget={w}
                scale={board.scale}
                onUpdate={store.updateWidget}
                onRemove={(id) => {
                  store.removeWidget(id);
                  save();
                }}
                onDragStart={handleWidgetDragStart}
                onResizeStart={handleResizeStart}
                linkMode={linkMode}
                onLinkClick={handleLinkClick}
              />
            ))}
        </div>
      </div>

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
