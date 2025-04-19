// hooks/useEmailManager.ts
import { useState, useCallback } from "react";
import { parseEmailCsv } from "../utils/csvParser";
import { validateEmail } from "../utils/emailValidation";

export type InputMode = "manual" | "csv" | "google" | "contacts";
export type EmailItem = { email: string; isValid: boolean; isNew?: boolean };

export function useEmailManager(initialEmails = "") {
  const [emails, setEmails] = useState<EmailItem[]>(
    initialEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)
      .map((email) => ({
        email,
        isValid: validateEmail(email),
      })),
  );
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getValidEmailString = useCallback(() => {
    return emails
      .filter((e) => e.isValid)
      .map((e) => e.email)
      .join(", ");
  }, [emails]);

  const addEmails = useCallback((newEmails: string[]) => {
    setEmails((prev) => {
      const existingEmails = new Set(prev.map((e) => e.email));

      const cleanedNew = newEmails
        .map((email) => email.trim().toLowerCase()) // normalize
        .filter((email) => email.length > 0); // only drop empty ones

      const uniqueNew = cleanedNew.filter(
        (email) => !existingEmails.has(email),
      );

      return [
        ...prev,
        ...uniqueNew.map((email) => ({
          email,
          isValid: validateEmail(email),
          isNew: true,
        })),
      ];
    });
  }, []);

  const removeEmail = useCallback((emailToRemove: string) => {
    const normalized = emailToRemove.trim().toLowerCase();
    setEmails((prev) => prev.filter((e) => e.email !== normalized));
  }, []);

  const clearEmails = useCallback(() => {
    setEmails([]);
  }, []);

  const handleCsvFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      const result = await parseEmailCsv(file);

      if (result.error) {
        setError(result.error);
      } else if (result.emails.length) {
        addEmails(result.emails);
      }

      setIsLoading(false);
    },
    [addEmails],
  );

  // Change input mode with automatic cleanup
  const setInputModeWithReset = useCallback(
    (mode: InputMode) => {
      if (mode !== inputMode) {
        clearEmails();
      }
      setInputMode(mode);
    },
    [inputMode, clearEmails],
  );

  return {
    emails,
    emailString: getValidEmailString(),
    inputMode,
    isLoading,
    error,
    isDragging,
    setEmails,
    addEmails,
    removeEmail,
    clearEmails,
    handleCsvFile,
    setInputModeWithReset,
    setIsDragging,
  };
}
