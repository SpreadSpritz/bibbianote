import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AuthOverlay from "@/components/AuthOverlay";
import BoardCanvas from "@/components/board/BoardCanvas";
import SettingsMenu from "@/components/SettingsMenu";

const Index = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-muted-foreground text-lg">{t("loading")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SettingsMenu />
        <AuthOverlay />
      </>
    );
  }

  return (
    <>
      <SettingsMenu />
      <BoardCanvas />
    </>
  );
};

export default Index;
