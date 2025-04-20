"use client";

import { useState, useCallback } from "react";
import { parseEmailCsv } from "../utils/csvParser";

interface UseCsvUploadOptions {
  onSuccess: (emails: string[]) => void;
}

export function useCsvUpload({ onSuccess }: UseCsvUploadOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCsvFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      const result = await parseEmailCsv(file);

      if (result.error) {
        setError(result.error);
      } else if (result.emails.length) {
        onSuccess(result.emails);
      }

      setIsLoading(false);
    },
    [onSuccess],
  );

  return {
    isLoading,
    error,
    isDragging,
    setIsDragging,
    handleCsvFile,
  };
}
