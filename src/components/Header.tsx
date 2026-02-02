import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">
              Latein Vokabeltrainer
            </h1>
            <p className="text-sm text-muted-foreground">
              Lerne deine Vokabeln mit Karteikarten
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
