import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  name: string;
  role: string;
}

export function ProfileHeader({ name, role }: ProfileHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 border-b bg-secondary px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-secondary-foreground hover:bg-secondary/80">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold leading-tight text-secondary-foreground">{name}</h1>
          <p className="text-sm text-secondary-foreground/70">{role}</p>
        </div>
      </div>
    </header>
  );
}
