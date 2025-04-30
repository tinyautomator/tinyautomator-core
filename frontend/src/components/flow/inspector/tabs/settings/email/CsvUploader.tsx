"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailFormValues } from "./utils/emailValidation";
import { useFormContext } from "react-hook-form";

import { parseEmailCsv } from "./utils/csvParser";
export function CsvUploader() {
  const { watch, setValue } = useFormContext<EmailFormValues>();
  const recipients = watch("recipients");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCsvFile(file);
  };

  const handleCsvFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedCsvFile = await parseEmailCsv(file);
      if (parsedCsvFile.error) {
        throw new Error(parsedCsvFile.error);
      }

      const incoming = parsedCsvFile.emails.map((e) => e.trim().toLowerCase());

      const seen = new Set(recipients);
      const dedupedEmails = incoming.filter((email) => {
        const isNew = !seen.has(email);
        if (isNew) seen.add(email);
        return isNew;
      });
      setValue("recipients", [...recipients, ...dedupedEmails]);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Failed to parse CSV.");
      }
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-muted"
        } ${isLoading ? "opacity-70" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleCsvFile(file);
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Processing CSV...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop CSV file or click to browse
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
