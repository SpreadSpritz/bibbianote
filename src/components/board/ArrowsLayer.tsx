import { useRef, useCallback, type PointerEvent } from "react";
import type { ConnectionData, WidgetData } from "@/types/board";

interface ArrowsLayerProps {
  connections: ConnectionData[];
  widgets: WidgetData[];
  scale: number;
  panX: number;
  panY: number;
  onUpdateConnection: (id: string, updates: Partial<ConnectionData>) => void;
  onRemoveConnection: (id: string) => void;
  onSave: () => void;
}

const SVG_OFFSET = 5000;

function getWidgetCenter(w: WidgetData) {
  return { x: w.x + w.width / 2, y: w.y + (w.height || 80) / 2 };
}

function edgePoint(
  cx: number, cy: number, w: number, h: number,
  tx: number, ty: number
) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const ratio = Math.abs(dy / dx);
  const aspect = (h + 20) / (w + 20);
  if (ratio < aspect) {
    return {
      x: cx + Math.sign(dx) * (w / 2 + 10),
      y: cy + Math.sign(dy) * (w / 2 + 10) * ratio,
    };
  }
  return {
    x: cx + Math.sign(dx) * ((h / 2 + 10) / ratio),
    y: cy + Math.sign(dy) * (h / 2 + 10),
  };
}

export default function ArrowsLayer({
  connections, widgets, scale, panX, panY,
  onUpdateConnection, onRemoveConnection, onSave,
}: ArrowsLayerProps) {
  const dragRef = useRef<{
    connId: string;
    startX: number;
    startY: number;
    initOffsetX: number;
    initOffsetY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: PointerEvent, conn: ConnectionData) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as SVGElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        connId: conn.id,
        startX: e.clientX,
        startY: e.clientY,
        initOffsetX: conn.offsetX,
        initOffsetY: conn.offsetY,
      };
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (e.clientX - d.startX) / scale;
      const dy = (e.clientY - d.startY) / scale;
      onUpdateConnection(d.connId, {
        offsetX: d.initOffsetX + dx,
        offsetY: d.initOffsetY + dy,
      });
    },
    [scale, onUpdateConnection]
  );

  const handlePointerUp = useCallback(() => {
    if (dragRef.current) {
      dragRef.current = null;
      onSave();
    }
  }, [onSave]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, connId: string) => {
      e.stopPropagation();
      onRemoveConnection(connId);
      onSave();
    },
    [onRemoveConnection, onSave]
  );

  return (
    <svg
      className="absolute z-[2] overflow-visible"
      style={{
        top: -SVG_OFFSET,
        left: -SVG_OFFSET,
        width: SVG_OFFSET * 2,
        height: SVG_OFFSET * 2,
        pointerEvents: "none",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <defs>
        <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto">
          <path d="M 0 0 L 14 5 L 0 10 Q 3 5 0 0" fill="hsl(var(--primary))" />
        </marker>
      </defs>
      <g>
        {connections.map((conn) => {
          const sw = widgets.find((w) => w.id === conn.sourceId);
          const tw = widgets.find((w) => w.id === conn.targetId);
          if (!sw || !tw) return null;

          const sc = getWidgetCenter(sw);
          const tc = getWidgetCenter(tw);
          const midX = (sc.x + tc.x) / 2;
          const midY = (sc.y + tc.y) / 2;
          const ctrlX = midX + conn.offsetX * 2;
          const ctrlY = midY + conn.offsetY * 2;

          const sEdge = edgePoint(sc.x, sc.y, sw.width, sw.height || 80, ctrlX, ctrlY);
          const tEdge = edgePoint(tc.x, tc.y, tw.width, tw.height || 80, ctrlX, ctrlY);

          const pinX = midX + conn.offsetX;
          const pinY = midY + conn.offsetY;

          return (
            <g key={conn.id}>
              <path
                d={`M ${sEdge.x + SVG_OFFSET} ${sEdge.y + SVG_OFFSET} Q ${ctrlX + SVG_OFFSET} ${ctrlY + SVG_OFFSET} ${tEdge.x + SVG_OFFSET} ${tEdge.y + SVG_OFFSET}`}
                stroke="hsl(var(--muted-foreground) / 0.5)"
                strokeWidth="2.5"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              {/* Invisible wider hit area for the path */}
              <path
                d={`M ${sEdge.x + SVG_OFFSET} ${sEdge.y + SVG_OFFSET} Q ${ctrlX + SVG_OFFSET} ${ctrlY + SVG_OFFSET} ${tEdge.x + SVG_OFFSET} ${tEdge.y + SVG_OFFSET}`}
                stroke="transparent"
                strokeWidth="16"
                fill="none"
                className="pointer-events-auto cursor-pointer"
                onDoubleClick={(e) => handleDoubleClick(e, conn.id)}
              />
              {/* Draggable control point */}
              <circle
                cx={pinX + SVG_OFFSET}
                cy={pinY + SVG_OFFSET}
                r="6"
                fill="hsl(var(--background))"
                stroke="hsl(var(--muted-foreground) / 0.6)"
                strokeWidth="2"
                className="pointer-events-auto cursor-grab active:cursor-grabbing hover:stroke-primary hover:stroke-[3px] transition-all"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => handlePointerDown(e, conn)}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
