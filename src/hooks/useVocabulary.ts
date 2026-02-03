import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vocabulary, PracticeResult, LessonStats } from "@/types/vocabulary";

// localStorage keys
const VOCABULARIES_KEY = "latin-vocab-vocabularies";
const PRACTICE_RESULTS_KEY = "latin-vocab-practice-results";

// Helper functions for localStorage
function getVocabularies(): Vocabulary[] {
  const data = localStorage.getItem(VOCABULARIES_KEY);
  return data ? JSON.parse(data) : [];
}

function saveVocabularies(vocabularies: Vocabulary[]): void {
  localStorage.setItem(VOCABULARIES_KEY, JSON.stringify(vocabularies));
}

function getPracticeResults(): PracticeResult[] {
  const data = localStorage.getItem(PRACTICE_RESULTS_KEY);
  return data ? JSON.parse(data) : [];
}

function savePracticeResults(results: PracticeResult[]): void {
  localStorage.setItem(PRACTICE_RESULTS_KEY, JSON.stringify(results));
}

function generateId(): string {
  return crypto.randomUUID();
}

export function useVocabularies() {
  return useQuery({
    queryKey: ["vocabularies"],
    queryFn: async () => {
      return getVocabularies().sort((a, b) => a.lesson_number - b.lesson_number);
    },
  });
}

export function useLessons() {
  const { data: vocabularies } = useVocabularies();
  
  const lessons = vocabularies?.reduce((acc, vocab) => {
    if (!acc.includes(vocab.lesson_number)) {
      acc.push(vocab.lesson_number);
    }
    return acc;
  }, [] as number[]) ?? [];
  
  return lessons.sort((a, b) => a - b);
}

export function useVocabulariesByLessons(lessons: number[]) {
  const { data: vocabularies } = useVocabularies();
  
  return vocabularies?.filter((v) => lessons.includes(v.lesson_number)) ?? [];
}

export function useUploadVocabularies() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vocabularies: Omit<Vocabulary, "id" | "created_at">[]) => {
      // Create full vocabulary objects with IDs and timestamps
      const fullVocabularies: Vocabulary[] = vocabularies.map((v) => ({
        ...v,
        id: generateId(),
        created_at: new Date().toISOString(),
      }));
      
      // Replace all vocabularies
      saveVocabularies(fullVocabularies);
      
      // Clear practice results when new vocabularies are uploaded
      savePracticeResults([]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
      queryClient.invalidateQueries({ queryKey: ["practice_results"] });
    },
  });
}

export function usePracticeResults() {
  return useQuery({
    queryKey: ["practice_results"],
    queryFn: async () => {
      return getPracticeResults().sort(
        (a, b) => new Date(b.practiced_at).getTime() - new Date(a.practiced_at).getTime()
      );
    },
  });
}

export function useRecordPracticeResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vocabulary_id, known }: { vocabulary_id: string; known: boolean }) => {
      const results = getPracticeResults();
      const newResult: PracticeResult = {
        id: generateId(),
        vocabulary_id,
        known,
        practiced_at: new Date().toISOString(),
      };
      results.push(newResult);
      savePracticeResults(results);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice_results"] });
    },
  });
}

export function useStats() {
  const { data: vocabularies } = useVocabularies();
  const { data: results } = usePracticeResults();
  
  if (!vocabularies || !results) {
    return {
      totalVocabularies: 0,
      totalPracticed: 0,
      totalKnown: 0,
      totalUnknown: 0,
      overallPercentage: 0,
      lessonStats: [] as LessonStats[],
    };
  }
  
  const totalVocabularies = vocabularies.length;
  const totalPracticed = results.length;
  const totalKnown = results.filter((r) => r.known).length;
  const totalUnknown = results.filter((r) => !r.known).length;
  const overallPercentage = totalPracticed > 0 ? Math.round((totalKnown / totalPracticed) * 100) : 0;
  
  // Stats per lesson
  const lessonMap = new Map<number, LessonStats>();
  
  vocabularies.forEach((v) => {
    if (!lessonMap.has(v.lesson_number)) {
      lessonMap.set(v.lesson_number, {
        lesson: v.lesson_number,
        total: 0,
        known: 0,
        unknown: 0,
        percentage: 0,
      });
    }
    const stat = lessonMap.get(v.lesson_number)!;
    stat.total++;
    
    // Get latest result for this vocabulary
    const vocabResults = results.filter((r) => r.vocabulary_id === v.id);
    if (vocabResults.length > 0) {
      const latestResult = vocabResults[0];
      if (latestResult.known) {
        stat.known++;
      } else {
        stat.unknown++;
      }
    }
  });
  
  const lessonStats = Array.from(lessonMap.values()).map((stat) => ({
    ...stat,
    percentage: stat.known + stat.unknown > 0 
      ? Math.round((stat.known / (stat.known + stat.unknown)) * 100) 
      : 0,
  })).sort((a, b) => a.lesson - b.lesson);
  
  return {
    totalVocabularies,
    totalPracticed,
    totalKnown,
    totalUnknown,
    overallPercentage,
    lessonStats,
  };
}
