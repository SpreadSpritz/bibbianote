
import type { ConnectionData, WidgetData } from "@/types/board";

interface ArrowsLayerProps {
  connections: ConnectionData[];
  widgets: WidgetData[];
  scale: number;
  panX: number;
  panY: number;
}

const SVG_OFFSET = 5000;

function getWidgetCenter(w: WidgetData) {
  return { x: w.x + w.width / 2, y: w.y + (w.height || 80) / 2 };
}

function edgePoint(
  cx: number, cy: number, w: number, h: number,
  tx: number, ty: number
) {
  let dx = tx - cx;
  let dy = ty - cy;
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

export default function ArrowsLayer({ connections, widgets, scale, panX, panY }: ArrowsLayerProps) {
  return (
    <svg
      className="absolute pointer-events-none z-0"
      style={{
        top: -SVG_OFFSET,
        left: -SVG_OFFSET,
        width: SVG_OFFSET * 2,
        height: SVG_OFFSET * 2,
      }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="13" refY="5" orient="auto">
          <path d="M 0 0 L 14 5 L 0 10 Q 3 5 0 0" fill="#a4a298" />
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

          return (
            <g key={conn.id}>
              <path
                d={`M ${sEdge.x + SVG_OFFSET} ${sEdge.y + SVG_OFFSET} Q ${ctrlX + SVG_OFFSET} ${ctrlY + SVG_OFFSET} ${tEdge.x + SVG_OFFSET} ${tEdge.y + SVG_OFFSET}`}
                stroke="#b0aba2"
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              <circle
                cx={midX + conn.offsetX + SVG_OFFSET}
                cy={midY + conn.offsetY + SVG_OFFSET}
                r="7"
                fill="#fff"
                stroke="#b0aba2"
                strokeWidth="2.5"
                className="pointer-events-auto cursor-grab hover:stroke-primary hover:stroke-[4px] transition-all"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
