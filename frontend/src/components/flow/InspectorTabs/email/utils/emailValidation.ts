// utils/emailValidation.ts
import { z } from "zod";

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email.trim()).success;
};

export const validateEmailList = (emails: string) => {
  const emailArray = emails
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const invalidEmails = emailArray.filter((email) => !validateEmail(email));

  return {
    isValid: invalidEmails.length === 0,
    invalidEmails,
    error:
      invalidEmails.length > 0
        ? `Invalid emails: ${invalidEmails.join(", ")}`
        : "",
  };
};
