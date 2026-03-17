export interface WidgetData {
  id: string;
  type: "nota" | "todo" | "foto" | "pannello_v" | "pannello_o";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  content: string;
  parentId: string | null;
  snap: boolean;
  title?: string;
}

export interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  offsetX: number;
  offsetY: number;
}

export interface BoardState {
  panX: number;
  panY: number;
  scale: number;
  widgets: WidgetData[];
  connections: ConnectionData[];
}
