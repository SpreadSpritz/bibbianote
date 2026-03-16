import { useRef, useCallback } from "react";
import { ImagePlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MediaBodyProps {
  content: string;
  widgetId: string;
  onUpdate: (id: string, updates: { content: string }) => void;
  linkMode: boolean;
}

export default function MediaBody({ content, widgetId, onUpdate, linkMode }: MediaBodyProps) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onUpdate(widgetId, { content: reader.result });
        }
      };
      reader.readAsDataURL(file);
    },
    [widgetId, onUpdate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (content) {
    const isVideo = content.startsWith("data:video/");
    return (
      <div className="p-2 flex-1 flex items-center justify-center min-h-[60px]">
        {isVideo ? (
          <video
            src={content}
            controls
            className="max-w-full max-h-full rounded-lg object-contain"
          />
        ) : (
          <img
            src={content}
            alt=""
            className="max-w-full max-h-full rounded-lg object-contain"
            draggable={false}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="p-4 flex-1 flex flex-col items-center justify-center gap-2 min-h-[80px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground/70 transition-colors"
      onClick={(e) => {
        if (linkMode) return;
        e.stopPropagation();
        fileRef.current?.click();
      }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <ImagePlus size={28} />
      <span className="text-xs text-center">{t("uploadMedia")}</span>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
