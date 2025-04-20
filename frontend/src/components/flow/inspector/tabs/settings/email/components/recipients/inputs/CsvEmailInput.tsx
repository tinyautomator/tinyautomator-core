"use client";

import type React from "react";

import { useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailChips } from "../shared/EmailChips";
import { validateEmail } from "../../../utils/emailValidation";

interface CsvEmailInputProps {
  emails: string[];
  addEmails: (emails: string[]) => void;
  clearEmails: () => void;
  isLoading: boolean;
  error: string | null;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  handleCsvFile: (file: File) => Promise<void>;
}

export function CsvEmailInput({
  emails,
  addEmails,
  clearEmails,
  isLoading,
  error,
  isDragging,
  setIsDragging,
  handleCsvFile,
}: CsvEmailInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCsvFile(file);
  };

  const handleEmailsChange = (updatedEmails: string[]) => {
    clearEmails();
    addEmails(updatedEmails);
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

      {emails.length > 0 && (
        <EmailChips
          emails={emails}
          onEmailsChange={handleEmailsChange}
          validateEmail={validateEmail}
        />
      )}
    </div>
  );
}
