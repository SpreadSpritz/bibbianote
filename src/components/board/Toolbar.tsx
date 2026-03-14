import { type ReactNode, type DragEvent } from "react";
import { FileText, CheckSquare, Image, Columns, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { WidgetData } from "@/types/board";

interface ToolbarProps {
  linkMode: boolean;
  onToggleLinkMode: () => void;
}

export default function Toolbar({ linkMode, onToggleLinkMode }: ToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 bg-card/95 p-2.5 rounded-2xl shadow-lg z-[1000] flex flex-col gap-3">
      <DragBtn icon={<FileText size={22} />} label={t("nota")} widgetType="nota" />
      <DragBtn icon={<CheckSquare size={22} />} label={t("task")} widgetType="todo" />
      <DragBtn icon={<Image size={22} />} label={t("media")} widgetType="foto" />
      <div className="h-px w-10 mx-auto bg-border" />
      <DragBtn icon={<Columns size={22} />} label={t("column")} widgetType="pannello_v" />
      <DragBtn icon={<Columns size={22} className="rotate-90" />} label={t("row")} widgetType="pannello_o" />
      <div className="h-px w-10 mx-auto bg-border" />
      <ToolBtn
        icon={<ArrowRight size={22} />}
        label={t("connect")}
        onClick={onToggleLinkMode}
        active={linkMode}
      />
    </div>
  );
}

function DragBtn({
  icon,
  label,
  widgetType,
}: {
  icon: ReactNode;
  label: string;
  widgetType: WidgetData["type"];
}) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("widget-type", widgetType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-lg text-muted-foreground text-[13px] font-medium transition-colors cursor-grab active:cursor-grabbing hover:bg-accent hover:text-foreground"
    >
      {icon}
      <span className="mt-1">{label}</span>
    </div>
  );
}

function ToolBtn({
  icon,
  label,
  onClick,
  active,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-lg text-muted-foreground text-[13px] font-medium transition-colors cursor-pointer
        ${active ? "bg-primary/10 text-primary outline outline-2 outline-primary/30" : "hover:bg-accent hover:text-foreground"}`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
}
