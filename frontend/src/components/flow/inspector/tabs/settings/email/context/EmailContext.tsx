"use client";

import type React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { validateEmail } from "../utils/emailValidation";

export type InputMode = "manual" | "csv" | "google" | "contacts";
export type EmailItem = { email: string; isValid: boolean; isNew?: boolean };

interface EmailContextType {
  recipientList: EmailItem[];
  recipientString: string;
  inputMode: InputMode;

  subject: string;
  body: string;
  maxBodyLength: number;

  isPreviewOpen: boolean;

  addRecipients: (emails: string[]) => void;
  clearRecipients: () => void;
  updateRecipients: (emails: string[]) => void;
  removeRecipient: (email: string) => void;
  setInputModeWithReset: (mode: InputMode) => void;
  setSubject: (subject: string) => void;
  setBody: (body: string) => void;
  setTemplate: (template: string) => void;
  setIsPreviewOpen: (isOpen: boolean) => void;
  formatPreviewEmails: (emails: string) => string;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

const MAX_BODY_CHARS = 2500;
const MAX_PREVIEW_EMAILS = 3;

export function EmailContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recipientList, setRecipientList] = useState<EmailItem[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("manual");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [template, setTemplate] = useState("custom");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getValidRecipientString = useCallback(() => {
    return recipientList
      .filter((e) => e.isValid)
      .map((e) => e.email)
      .join(", ");
  }, [recipientList]);

  const addRecipients = useCallback((newEmails: string[]) => {
    setRecipientList((prev) => {
      const existingEmails = new Set(prev.map((e) => e.email));

      const cleanedNew = newEmails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0);

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

  const setInputModeWithReset = useCallback(
    (mode: InputMode) => {
      if (mode !== inputMode) {
        clearRecipients();
      }
      setInputMode(mode);
    },
    [inputMode, clearRecipients],
  );

  const formatPreviewEmails = useCallback((emails: string): string => {
    const emailList = emails.split(/,\s*/).filter(Boolean);
    if (emailList.length <= MAX_PREVIEW_EMAILS) return emails;

    return `${emailList.slice(0, MAX_PREVIEW_EMAILS).join(", ")} ... (${emailList.length - MAX_PREVIEW_EMAILS} more)`;
  }, []);

  const value = {
    recipientList,
    recipientString: getValidRecipientString(),
    inputMode,
    subject,
    body,
    template,
    isPreviewOpen,
    addRecipients,
    clearRecipients,
    updateRecipients,
    removeRecipient,
    setInputModeWithReset,
    setSubject,
    setBody,
    setTemplate,
    setIsPreviewOpen,
    formatPreviewEmails,
    maxBodyLength: MAX_BODY_CHARS,
  };

  return (
    <EmailContext.Provider value={value}>{children}</EmailContext.Provider>
  );
}

export function useEmailContext() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error(
      "useEmailContext must be used within an EmailContextProvider",
    );
  }
  return context;
}
