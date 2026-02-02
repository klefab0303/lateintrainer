import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vocabulary, PracticeResult, LessonStats } from "@/types/vocabulary";

export function useVocabularies() {
  return useQuery({
    queryKey: ["vocabularies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vocabularies")
        .select("*")
        .order("lesson_number", { ascending: true });
      
      if (error) throw error;
      return data as Vocabulary[];
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
      // First delete all existing vocabularies
      await supabase.from("vocabularies").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      // Then insert new ones
      const { error } = await supabase
        .from("vocabularies")
        .insert(vocabularies);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
    },
  });
}

export function usePracticeResults() {
  return useQuery({
    queryKey: ["practice_results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practice_results")
        .select("*")
        .order("practiced_at", { ascending: false });
      
      if (error) throw error;
      return data as PracticeResult[];
    },
  });
}

export function useRecordPracticeResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vocabulary_id, known }: { vocabulary_id: string; known: boolean }) => {
      const { error } = await supabase
        .from("practice_results")
        .insert({ vocabulary_id, known });
      
      if (error) throw error;
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
