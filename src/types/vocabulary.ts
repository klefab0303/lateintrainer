export interface Vocabulary {
  id: string;
  latin_word: string;
  forms: string | null;
  german_translation: string;
  lesson_number: number;
  created_at: string;
}

export interface PracticeResult {
  id: string;
  vocabulary_id: string;
  known: boolean;
  practiced_at: string;
}

export interface LessonStats {
  lesson: number;
  total: number;
  known: number;
  unknown: number;
  percentage: number;
}
