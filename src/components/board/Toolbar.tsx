import type { ReactNode } from "react";
import { FileText, CheckSquare, Image, Columns, ArrowRight } from "lucide-react";

interface ToolbarProps {
  onSpawn: (type: "nota" | "todo" | "foto" | "pannello_v" | "pannello_o") => void;
  linkMode: boolean;
  onToggleLinkMode: () => void;
}

export default function Toolbar({ onSpawn, linkMode, onToggleLinkMode }: ToolbarProps) {
  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 bg-card/95 p-2.5 rounded-2xl shadow-lg z-[1000] flex flex-col gap-3">
      <ToolBtn icon={<FileText size={22} />} label="Nota" onClick={() => onSpawn("nota")} />
      <ToolBtn icon={<CheckSquare size={22} />} label="Task" onClick={() => onSpawn("todo")} />
      <ToolBtn icon={<Image size={22} />} label="Media" onClick={() => onSpawn("foto")} />
      <div className="h-px w-10 mx-auto bg-border" />
      <ToolBtn icon={<Columns size={22} />} label="Colonna" onClick={() => onSpawn("pannello_v")} />
      <ToolBtn icon={<Columns size={22} className="rotate-90" />} label="Riga" onClick={() => onSpawn("pannello_o")} />
      <div className="h-px w-10 mx-auto bg-border" />
      <ToolBtn
        icon={<ArrowRight size={22} />}
        label="Connetti"
        onClick={onToggleLinkMode}
        active={linkMode}
      />
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
