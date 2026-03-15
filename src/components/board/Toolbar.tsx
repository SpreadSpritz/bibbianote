import { type ReactNode, type DragEvent } from "react";
import { FileText, CheckSquare, Image, Columns, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import type { WidgetData } from "@/types/board";

interface ToolbarProps {
  linkMode: boolean;
  onToggleLinkMode: () => void;
  selectedTool: WidgetData["type"] | null;
  onSelectTool: (type: WidgetData["type"] | null) => void;
}

export default function Toolbar({ linkMode, onToggleLinkMode, selectedTool, onSelectTool }: ToolbarProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const tools: { icon: ReactNode; label: string; type: WidgetData["type"]; rotated?: boolean }[] = [
    { icon: <FileText size={isMobile ? 18 : 22} />, label: t("nota"), type: "nota" },
    { icon: <CheckSquare size={isMobile ? 18 : 22} />, label: t("task"), type: "todo" },
    { icon: <Image size={isMobile ? 18 : 22} />, label: t("media"), type: "foto" },
    { icon: <Columns size={isMobile ? 18 : 22} />, label: t("column"), type: "pannello_v" },
    { icon: <Columns size={isMobile ? 18 : 22} className="rotate-90" />, label: t("row"), type: "pannello_o" },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm p-2 rounded-2xl shadow-lg z-[1000] flex flex-row gap-1">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onSelectTool(selectedTool === tool.type ? null : tool.type)}
            className={`flex flex-col items-center justify-center w-[50px] h-[50px] rounded-lg text-[11px] font-medium transition-colors
              ${selectedTool === tool.type ? "bg-primary/10 text-primary outline outline-2 outline-primary/30" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
          >
            {tool.icon}
            <span className="mt-0.5">{tool.label}</span>
          </button>
        ))}
        <div className="w-px h-10 my-auto bg-border" />
        <button
          onClick={onToggleLinkMode}
          className={`flex flex-col items-center justify-center w-[50px] h-[50px] rounded-lg text-[11px] font-medium transition-colors
            ${linkMode ? "bg-primary/10 text-primary outline outline-2 outline-primary/30" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          <ArrowRight size={18} />
          <span className="mt-0.5">{t("connect")}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 bg-card/95 p-2.5 rounded-2xl shadow-lg z-[1000] flex flex-col gap-3">
      {tools.slice(0, 3).map((tool) => (
        <DragBtn
          key={tool.type}
          icon={tool.icon}
          label={tool.label}
          widgetType={tool.type}
          selected={selectedTool === tool.type}
          onSelect={() => onSelectTool(selectedTool === tool.type ? null : tool.type)}
        />
      ))}
      <div className="h-px w-10 mx-auto bg-border" />
      {tools.slice(3).map((tool) => (
        <DragBtn
          key={tool.type}
          icon={tool.icon}
          label={tool.label}
          widgetType={tool.type}
          selected={selectedTool === tool.type}
          onSelect={() => onSelectTool(selectedTool === tool.type ? null : tool.type)}
        />
      ))}
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
  selected,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  widgetType: WidgetData["type"];
  selected?: boolean;
  onSelect: () => void;
}) {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.setData("widget-type", widgetType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onSelect}
      className={`flex flex-col items-center justify-center w-[60px] h-[60px] rounded-lg text-[13px] font-medium transition-colors cursor-grab active:cursor-grabbing
        ${selected ? "bg-primary/10 text-primary outline outline-2 outline-primary/30" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
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
