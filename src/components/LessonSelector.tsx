import { useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLessons, useVocabularies } from "@/hooks/useVocabulary";

interface LessonSelectorProps {
  onStartPractice: (lessons: number[]) => void;
}

export function LessonSelector({ onStartPractice }: LessonSelectorProps) {
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const lessons = useLessons();
  const { data: vocabularies } = useVocabularies();

  const toggleLesson = (lesson: number) => {
    setSelectedLessons((prev) =>
      prev.includes(lesson)
        ? prev.filter((l) => l !== lesson)
        : [...prev, lesson]
    );
  };

  const selectAll = () => {
    setSelectedLessons(lessons);
  };

  const deselectAll = () => {
    setSelectedLessons([]);
  };

  const getVocabCountForLesson = (lesson: number) => {
    return vocabularies?.filter((v) => v.lesson_number === lesson).length ?? 0;
  };

  const totalSelected = selectedLessons.reduce(
    (acc, lesson) => acc + getVocabCountForLesson(lesson),
    0
  );

  if (lessons.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Keine Vokabeln vorhanden. Lade zuerst eine CSV-Datei hoch.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center justify-between">
          <span>Lektionen auswählen</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Alle
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll}>
              Keine
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {lessons.map((lesson) => (
            <div
              key={lesson}
              onClick={() => toggleLesson(lesson)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${selectedLessons.includes(lesson)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
                }
              `}
            >
              <Checkbox
                checked={selectedLessons.includes(lesson)}
                onCheckedChange={() => toggleLesson(lesson)}
              />
              <div>
                <p className="font-medium text-foreground">Lektion {lesson}</p>
                <p className="text-xs text-muted-foreground">
                  {getVocabCountForLesson(lesson)} Vokabeln
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedLessons.length} Lektionen, {totalSelected} Vokabeln ausgewählt
          </p>
          <Button
            onClick={() => onStartPractice(selectedLessons)}
            disabled={selectedLessons.length === 0}
            className="gap-2"
          >
            Weiter
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
