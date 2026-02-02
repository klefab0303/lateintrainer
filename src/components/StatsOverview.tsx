import { BookOpen, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/useVocabulary";

export function StatsOverview() {
  const stats = useStats();

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Vokabeln"
          value={stats.totalVocabularies}
          subtitle="Gesamt geladen"
          icon={BookOpen}
          variant="default"
        />
        <StatsCard
          title="Geübt"
          value={stats.totalPracticed}
          subtitle="Antworten insgesamt"
          icon={TrendingUp}
          variant="amber"
        />
        <StatsCard
          title="Gewusst"
          value={stats.totalKnown}
          subtitle={`${stats.overallPercentage}% Erfolgsrate`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Nicht gewusst"
          value={stats.totalUnknown}
          icon={XCircle}
          variant="destructive"
        />
      </div>

      {/* Lesson breakdown */}
      {stats.lessonStats.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Fortschritt nach Lektion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lessonStats.map((lesson) => (
                <div key={lesson.lesson} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">
                      Lektion {lesson.lesson}
                    </span>
                    <span className="text-muted-foreground">
                      {lesson.known}/{lesson.total} ({lesson.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-500"
                      style={{ width: `${lesson.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
