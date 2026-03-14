import { useAuth } from "@/contexts/AuthContext";
import AuthOverlay from "@/components/AuthOverlay";
import BoardCanvas from "@/components/board/BoardCanvas";

const Index = () => {
  const { user, loading } = useAuth();
  console.log("[Index] loading:", loading, "user:", user?.uid);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-muted-foreground text-lg">Caricamento...</span>
      </div>
    );
  }

  if (!user) return <AuthOverlay />;

  return <BoardCanvas />;
};

export default Index;
