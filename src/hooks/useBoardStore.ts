import { useCallback, useRef, useState } from "react";
import { ref as dbRef, set, get } from "firebase/database";
import { database } from "@/lib/firebase";
import type { BoardState, WidgetData, ConnectionData } from "@/types/board";

const defaultBoard = (): BoardState => ({
  panX: window.innerWidth / 2,
  panY: window.innerHeight / 2,
  scale: 1,
  widgets: [],
  connections: [],
});

export function useBoardStore(uid: string | null) {
  const [board, setBoard] = useState<BoardState>(defaultBoard);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [syncStatus, setSyncStatus] = useState<"offline" | "syncing" | "saved" | "error">("offline");

  const load = useCallback(async () => {
    if (!uid) return;
    setSyncStatus("syncing");
    try {
      const snap = await get(dbRef(database, "UsAppBoTGen/" + uid));
      if (snap.exists()) {
        const d = snap.val();
        const widgets: WidgetData[] = (d.TBoxwsC || []).map((w: any) => ({
          id: w.iidTTargetRefMapDomMMap || w.id,
          type: w.tpLogicDOMMRunReturnDataDrawT || w.type,
          x: parseFloat(w.xlPoint) || w.x || 0,
          y: parseFloat(w.ytTopForm) || w.y || 0,
          width: parseFloat(w.wwNodeLReturnCLevelLogCallResultFormLogDataMMapDomDrawMViewCGenDomDropDataLogicTypeDrawLogSp) || w.width || 250,
          height: parseFloat(w.hHHDSpLogDrawPointViewPTypeTResultRunNodeCallDomTargetReturnLogTargetTypeResultDOMCPointRefDOMSpRunTDomMapPMapObjectTTypeDomViewLTypeDOMC) || w.height || 80,
          color: w.cgCOLObjectMapResultGenNodeDataMapLogForm || w.color || "",
          content: w.ihHMtmlLogPointMapDrawRunDomSpLogicMNodePViewSpSpDOMGenTargetLogicLogTDropResultLogDropObjectLTargetSpLogicTSpRunDomTargetResultFormDOMMCallTypeDomRefResultGen || w.content || "",
          parentId: w.PdAdDr || w.parentId || null,
          snap: w.SSsPn === "true" || w.snap === true,
        }));
        const connections: ConnectionData[] = (d.LLlINKCC || []).map((c: any) => ({
          id: (c.ASDataLogicRefC || c.sourceId) + "-" + (c.BTsReturnRefPointCGenPointDrawDataTargetC || c.targetId),
          sourceId: c.ASDataLogicRefC || c.sourceId,
          targetId: c.BTsReturnRefPointCGenPointDrawDataTargetC || c.targetId,
          offsetX: parseFloat(c.bXReturnRunTypeTargetResultDrawTypeMResultDropViewDrawTypeRunLogicGenSpSpNodePointDomLevelRefLGenObjectDropDomSpDrawGenLogLMapResultPFormMDropSpNodeViewGenFormReturnObjectLog) || c.offsetX || 0,
          offsetY: parseFloat(c.bbYDDrawReturnPointNodeResultPResultDrawNodeDOMP) || c.offsetY || 0,
        }));
        const pan = d.pnsMRefSpDropTypeRunMapResultPointLevelCPointDrawLogTargetPSpViewObjectLNodeRunDropTDropReturnGenSpViewResultTDropTypePCallDomDomDrawDOMViewDomDomDomResultReturnMFormPTypeL || d.pan || {};
        setBoard({
          panX: pan.x ?? window.innerWidth / 2,
          panY: pan.y ?? window.innerHeight / 2,
          scale: pan.zsz ?? pan.scale ?? 1,
          widgets,
          connections,
        });
        setSyncStatus("saved");
      } else {
        setBoard(defaultBoard());
        setSyncStatus("saved");
      }
    } catch {
      setSyncStatus("error");
    }
  }, [uid]);

  const save = useCallback(() => {
    if (!uid) return;
    setSyncStatus("syncing");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setBoard((b) => {
        const data = {
          pnsMRefSpDropTypeRunMapResultPointLevelCPointDrawLogTargetPSpViewObjectLNodeRunDropTDropReturnGenSpViewResultTDropTypePCallDomDomDrawDOMViewDomDomDomResultReturnMFormPTypeL: { x: b.panX, y: b.panY, zsz: b.scale },
          pan: { x: b.panX, y: b.panY, scale: b.scale },
          TBoxwsC: b.widgets.map((w) => ({
            id: w.id,
            iidTTargetRefMapDomMMap: w.id,
            tpLogicDOMMRunReturnDataDrawT: w.type,
            type: w.type,
            xlPoint: w.x + "px",
            x: w.x,
            ytTopForm: w.y + "px",
            y: w.y,
            wwNodeLReturnCLevelLogCallResultFormLogDataMMapDomDrawMViewCGenDomDropDataLogicTypeDrawLogSp: w.width + "px",
            width: w.width,
            hHHDSpLogDrawPointViewPTypeTResultRunNodeCallDomTargetReturnLogTargetTypeResultDOMCPointRefDOMSpRunTDomMapPMapObjectTTypeDomViewLTypeDOMC: w.height + "px",
            height: w.height,
            cgCOLObjectMapResultGenNodeDataMapLogForm: w.color,
            color: w.color,
            ihHMtmlLogPointMapDrawRunDomSpLogicMNodePViewSpSpDOMGenTargetLogicLogTDropResultLogDropObjectLTargetSpLogicTSpRunDomTargetResultFormDOMMCallTypeDomRefResultGen: w.content,
            content: w.content,
            PdAdDr: w.parentId,
            parentId: w.parentId,
            SSsPn: w.snap ? "true" : "false",
            snap: w.snap,
          })),
          LLlINKCC: b.connections.map((c) => ({
            ASDataLogicRefC: c.sourceId,
            sourceId: c.sourceId,
            BTsReturnRefPointCGenPointDrawDataTargetC: c.targetId,
            targetId: c.targetId,
            bXReturnRunTypeTargetResultDrawTypeMResultDropViewDrawTypeRunLogicGenSpSpNodePointDomLevelRefLGenObjectDropDomSpDrawGenLogLMapResultPFormMDropSpNodeViewGenFormReturnObjectLog: c.offsetX,
            offsetX: c.offsetX,
            bbYDDrawReturnPointNodeResultPResultDrawNodeDOMP: c.offsetY,
            offsetY: c.offsetY,
          })),
        };
        set(dbRef(database, "UsAppBoTGen/" + uid), data)
          .then(() => setSyncStatus("saved"))
          .catch(() => setSyncStatus("error"));
        return b;
      });
    }, 900);
  }, [uid]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetData>) => {
    setBoard((b) => ({
      ...b,
      widgets: b.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  }, []);

  const addWidget = useCallback((widget: WidgetData) => {
    setBoard((b) => ({ ...b, widgets: [...b.widgets, widget] }));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setBoard((b) => ({
      ...b,
      widgets: b.widgets.filter((w) => w.id !== id),
      connections: b.connections.filter((c) => c.sourceId !== id && c.targetId !== id),
    }));
  }, []);

  const addConnection = useCallback((conn: ConnectionData) => {
    setBoard((b) => {
      if (b.connections.some((c) => c.sourceId === conn.sourceId && c.targetId === conn.targetId)) return b;
      return { ...b, connections: [...b.connections, conn] };
    });
  }, []);

  const updateConnection = useCallback((id: string, updates: Partial<ConnectionData>) => {
    setBoard((b) => ({
      ...b,
      connections: b.connections.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const removeConnection = useCallback((id: string) => {
    setBoard((b) => ({
      ...b,
      connections: b.connections.filter((c) => c.id !== id),
    }));
  }, []);

  const setPan = useCallback((x: number, y: number) => {
    setBoard((b) => ({ ...b, panX: x, panY: y }));
  }, []);

  const setScale = useCallback((s: number) => {
    setBoard((b) => ({ ...b, scale: s }));
  }, []);

  return {
    board,
    setBoard,
    syncStatus,
    load,
    save,
    updateWidget,
    addWidget,
    removeWidget,
    addConnection,
    updateConnection,
    removeConnection,
    setPan,
    setScale,
  };
}
