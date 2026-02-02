-- Vokabeln Tabelle
CREATE TABLE public.vocabularies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  latin_word TEXT NOT NULL,
  forms TEXT,
  german_translation TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Statistik Tabelle für Lernergebnisse
CREATE TABLE public.practice_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vocabulary_id UUID NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
  known BOOLEAN NOT NULL,
  practiced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS aktivieren (public für alle zugänglich - keine Auth nötig für diese Lern-App)
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_results ENABLE ROW LEVEL SECURITY;

-- Öffentliche Policies für Lern-App ohne Login
CREATE POLICY "Vocabularies are viewable by everyone" 
ON public.vocabularies FOR SELECT USING (true);

CREATE POLICY "Anyone can insert vocabularies" 
ON public.vocabularies FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete vocabularies" 
ON public.vocabularies FOR DELETE USING (true);

CREATE POLICY "Practice results are viewable by everyone" 
ON public.practice_results FOR SELECT USING (true);

CREATE POLICY "Anyone can insert practice results" 
ON public.practice_results FOR INSERT WITH CHECK (true);