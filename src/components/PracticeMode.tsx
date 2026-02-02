import { useState, useMemo } from "react";
import { ArrowLeft, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flashcard } from "./Flashcard";
import { useVocabulariesByLessons, useRecordPracticeResult } from "@/hooks/useVocabulary";

interface PracticeModeProps {
  lessons: number[];
  onBack: () => void;
}

export function PracticeMode({ lessons, onBack }: PracticeModeProps) {
  const vocabularies = useVocabulariesByLessons(lessons);
  const recordResult = useRecordPracticeResult();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ known: number; unknown: number }>({
    known: 0,
    unknown: 0,
  });

  // Shuffle vocabularies
  const shuffledVocabularies = useMemo(() => {
    return [...vocabularies].sort(() => Math.random() - 0.5);
  }, [vocabularies]);

  const isComplete = currentIndex >= shuffledVocabularies.length;
  const currentVocab = shuffledVocabularies[currentIndex];

  const handleResult = async (known: boolean) => {
    // Record result to database
    await recordResult.mutateAsync({
      vocabulary_id: currentVocab.id,
      known,
    });

    // Update local stats
    setResults((prev) => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));

    // Move to next card
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setResults({ known: 0, unknown: 0 });
  };

  if (shuffledVocabularies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Keine Vokabeln für diese Lektionen gefunden.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          Zurück
        </Button>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((results.known / shuffledVocabularies.length) * 100);
    
    return (
      <Card className="max-w-xl mx-auto border-border/50">
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-amber/10">
            <Trophy className="h-12 w-12 text-amber" />
          </div>
          
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Übung abgeschlossen!
            </h2>
            <p className="text-muted-foreground">
              Du hast alle {shuffledVocabularies.length} Vokabeln durchgearbeitet.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-success">{results.known}</p>
              <p className="text-sm text-muted-foreground">Gewusst</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-destructive">{results.unknown}</p>
              <p className="text-sm text-muted-foreground">Nicht gewusst</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-serif font-bold text-primary">{percentage}%</p>
              <p className="text-sm text-muted-foreground">Erfolgsrate</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={onBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Nochmal üben
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Auswahl
      </Button>

      <Flashcard
        vocabulary={currentVocab}
        onResult={handleResult}
        current={currentIndex + 1}
        total={shuffledVocabularies.length}
      />
    </div>
  );
}
