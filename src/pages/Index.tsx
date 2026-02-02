import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { CSVUpload } from "@/components/CSVUpload";
import { StatsOverview } from "@/components/StatsOverview";
import { LessonSelector } from "@/components/LessonSelector";
import { PracticeMode } from "@/components/PracticeMode";

type Mode = "home" | "select" | "practice";

const Index = () => {
  const [mode, setMode] = useState<Mode>("home");
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);

  const handleStartPractice = (lessons: number[]) => {
    setSelectedLessons(lessons);
    setMode("practice");
  };

  const handleBack = () => {
    if (mode === "practice") {
      setMode("select");
    } else {
      setMode("home");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {mode === "home" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                Latein Vokabeln meistern
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Lade deine Vokabeln hoch und lerne sie mit dem bewährten Karteikarten-System.
              </p>
            </div>

            {/* Stats */}
            <StatsOverview />

            {/* Start Practice Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => setMode("select")}
                size="lg"
                className="gap-2 text-lg px-8 py-6"
              >
                <GraduationCap className="h-5 w-5" />
                Üben starten
              </Button>
            </div>

            {/* CSV Upload */}
            <CSVUpload />
          </div>
        )}

        {mode === "select" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Button onClick={handleBack} variant="ghost" className="gap-2">
              ← Zurück zur Übersicht
            </Button>
            <LessonSelector onStartPractice={handleStartPractice} />
          </div>
        )}

        {mode === "practice" && (
          <div className="max-w-4xl mx-auto">
            <PracticeMode lessons={selectedLessons} onBack={handleBack} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
