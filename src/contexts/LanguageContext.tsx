import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "it" | "ja";

const translations = {
  en: {
    loading: "Loading...",
    loginTitle: "My Cloud Board",
    usernamePlaceholder: "Enter a personal username",
    passwordPlaceholder: "Your secure password",
    loginBtn: "Access Your Profile / Notes",
    registerBtn: "Create New Account 👤",
    nota: "Note",
    task: "Task",
    media: "Media",
    column: "Column",
    row: "Row",
    connect: "Connect",
    logout: "Log Out",
    reset: "Reset",
    saved: "Saved",
    syncing: "Saving...",
    offline: "Offline",
    error: "Error",
    settings: "Settings",
    language: "Language",
    writeHere: "Write here...",
    taskList: "Task list...",
    addTask: "Add task...",
    uploadMedia: "Click or drop image",
  },
  it: {
    loading: "Caricamento...",
    loginTitle: "My Cloud Board",
    usernamePlaceholder: "Digita un Username personale",
    passwordPlaceholder: "La tua password sicura",
    loginBtn: "Accedi al Tuo Profilo / Note",
    registerBtn: "Crea Nuova Utenza 👤",
    nota: "Nota",
    task: "Task",
    media: "Media",
    column: "Colonna",
    row: "Riga",
    connect: "Connetti",
    logout: "Esci",
    reset: "Reset",
    saved: "Salvato",
    syncing: "Salvataggio...",
    offline: "Assente",
    error: "Errore",
    settings: "Impostazioni",
    language: "Lingua",
    writeHere: "Scrivi qui...",
    taskList: "Lista attività...",
    addTask: "Aggiungi attività...",
    uploadMedia: "Clicca o trascina immagine",
  },
  ja: {
    loading: "読み込み中...",
    loginTitle: "My Cloud Board",
    usernamePlaceholder: "ユーザー名を入力",
    passwordPlaceholder: "パスワードを入力",
    loginBtn: "ログイン",
    registerBtn: "新規登録 👤",
    nota: "ノート",
    task: "タスク",
    media: "メディア",
    column: "カラム",
    row: "行",
    connect: "接続",
    logout: "ログアウト",
    reset: "リセット",
    saved: "保存済み",
    syncing: "保存中...",
    offline: "オフライン",
    error: "エラー",
    settings: "設定",
    language: "言語",
    writeHere: "ここに入力...",
    taskList: "タスクリスト...",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved as Lang) || "en";
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("app-lang", l);
  };

  const t = (key: TranslationKey) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
