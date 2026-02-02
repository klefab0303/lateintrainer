import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadVocabularies } from "@/hooks/useVocabulary";
import { useToast } from "@/hooks/use-toast";

export function CSVUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadVocabularies();
  const { toast } = useToast();

  const parseCSV = (content: string) => {
    const lines = content.trim().split("\n");
    const vocabularies = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by semicolon or comma
      const parts = line.includes(";") ? line.split(";") : line.split(",");
      
      if (parts.length >= 4) {
        const latin_word = parts[0].trim();
        const forms = parts[1].trim() || null;
        const german_translation = parts[2].trim();
        const lesson_number = parseInt(parts[3].trim(), 10);

        if (latin_word && german_translation && !isNaN(lesson_number)) {
          vocabularies.push({
            latin_word,
            forms,
            german_translation,
            lesson_number,
          });
        }
      }
    }

    return vocabularies;
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Fehler",
        description: "Bitte eine CSV-Datei hochladen",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);

    try {
      const content = await file.text();
      const vocabularies = parseCSV(content);

      if (vocabularies.length === 0) {
        toast({
          title: "Fehler",
          description: "Keine gültigen Vokabeln in der Datei gefunden",
          variant: "destructive",
        });
        return;
      }

      await uploadMutation.mutateAsync(vocabularies);

      toast({
        title: "Erfolgreich!",
        description: `${vocabularies.length} Vokabeln wurden hochgeladen`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hochladen der Vokabeln",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Vokabeln hochladen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-accent/50"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          
          {uploadMutation.isPending ? (
            <div className="space-y-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Hochladen...</p>
            </div>
          ) : fileName ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 mx-auto text-success" />
              <p className="font-medium text-foreground">{fileName}</p>
              <p className="text-sm text-muted-foreground">Klicke, um eine neue Datei hochzuladen</p>
            </div>
          ) : (
            <div className="space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="font-medium text-foreground">CSV-Datei hier ablegen</p>
              <p className="text-sm text-muted-foreground">
                oder klicken zum Auswählen
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Format: Latein; Formen; Deutsch; Lektion
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
