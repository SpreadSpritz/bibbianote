import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, type Lang } from "@/contexts/LanguageContext";

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

export default function SettingsMenu() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="fixed top-4 left-4 z-[1002]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 rounded-xl bg-card/90 shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGES.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => setLang(l.code)}
              className={lang === l.code ? "bg-accent font-semibold" : ""}
            >
              <span className="mr-2">{l.flag}</span>
              {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
