import { z } from "zod";

export const emailSchema = z.string().email();

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email.trim()).success;
}

export const MAX_MESSAGE_CHAR_COUNT = 2500;

export const MAX_SUBJECT_CHAR_COUNT = 100;

export const emailFormSchema = z.object({
  recipients: z
    .array(z.string())
    .transform((emails) => emails.filter(validateEmail))
    .refine((emails) => emails.length > 0, {
      message: "At least one valid email recipient is required",
    }),
  subject: z
    .string()
    .min(1, { message: "Subject is required" })
    .max(MAX_SUBJECT_CHAR_COUNT, {
      message: `Subject must be under ${MAX_SUBJECT_CHAR_COUNT} characters`,
    }),
  message: z
    .string()
    .min(1, { message: "Message body is required" })
    .max(MAX_MESSAGE_CHAR_COUNT, {
      message: `Message must be under ${MAX_MESSAGE_CHAR_COUNT} characters`,
    }),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeEmails(emails: string[]): string[] {
  return emails.map(normalizeEmail);
}
