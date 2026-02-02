import { useState } from "react";
import { Eye, Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Vocabulary } from "@/types/vocabulary";

interface FlashcardProps {
  vocabulary: Vocabulary;
  onResult: (known: boolean) => void;
  current: number;
  total: number;
}

export function Flashcard({ vocabulary, onResult, current, total }: FlashcardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleResult = (known: boolean) => {
    setIsRevealed(false);
    onResult(known);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Lektion {vocabulary.lesson_number}</span>
        <span>{current} / {total}</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Latin word - always visible */}
          <div className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/30">
            <p className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {vocabulary.latin_word}
            </p>
          </div>

          {/* Reveal section */}
          {!isRevealed ? (
            <div className="p-8 text-center">
              <Button
                onClick={handleReveal}
                size="lg"
                variant="outline"
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Eye className="h-5 w-5" />
                Aufdecken
              </Button>
            </div>
          ) : (
            <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Forms */}
              {vocabulary.forms && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Formen
                  </p>
                  <p className="text-lg text-foreground font-medium">
                    {vocabulary.forms}
                  </p>
                </div>
              )}

              {/* German translation */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Übersetzung
                </p>
                <p className="text-2xl font-serif font-bold text-primary">
                  {vocabulary.german_translation}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={() => handleResult(false)}
                  variant="outline"
                  size="lg"
                  className="flex-1 max-w-[140px] gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-5 w-5" />
                  Nicht gewusst
                </Button>
                <Button
                  onClick={() => handleResult(true)}
                  size="lg"
                  className="flex-1 max-w-[140px] gap-2 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Check className="h-5 w-5" />
                  Gewusst
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
