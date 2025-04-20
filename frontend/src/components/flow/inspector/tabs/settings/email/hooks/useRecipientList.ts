"use client";

import { useState, useCallback } from "react";
import { validateEmail } from "../utils/emailValidation";

export type InputMode = "manual" | "csv" | "google" | "contacts";
export type EmailItem = { email: string; isValid: boolean; isNew?: boolean };

export function useRecipientList(initialEmails = "") {
  const [recipientList, setRecipientList] = useState<EmailItem[]>(
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

  const getValidEmailString = useCallback(() => {
    return recipientList
      .filter((e) => e.isValid)
      .map((e) => e.email)
      .join(", ");
  }, [recipientList]);

  const addRecipients = useCallback((newEmails: string[]) => {
    setRecipientList((prev) => {
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

  const removeRecipient = useCallback((emailToRemove: string) => {
    const normalized = emailToRemove.trim().toLowerCase();
    setRecipientList((prev) => prev.filter((e) => e.email !== normalized));
  }, []);

  const clearRecipients = useCallback(() => {
    setRecipientList([]);
  }, []);

  const updateRecipients = useCallback(
    (emails: string[]) => {
      clearRecipients();
      addRecipients(emails);
    },
    [clearRecipients, addRecipients],
  );

  // Change input mode with automatic cleanup
  const setInputModeWithReset = useCallback(
    (mode: InputMode) => {
      if (mode !== inputMode) {
        clearRecipients();
      }
      setInputMode(mode);
    },
    [inputMode, clearRecipients],
  );

  return {
    recipientList,
    emailString: getValidEmailString(),
    inputMode,
    setRecipientList,
    addRecipients,
    removeRecipient,
    clearRecipients,
    updateRecipients,
    setInputModeWithReset,
  };
}
