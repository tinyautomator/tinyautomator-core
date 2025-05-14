import { z } from "zod";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const emailSchema = z.string().email().transform(normalizeEmail);

export function parseEmail(email: string): string | null {
  const result = emailSchema.safeParse(email);
  return result.success ? result.data : null;
}

export const MAX_MESSAGE_CHAR_COUNT = 2500;

export const MAX_SUBJECT_CHAR_COUNT = 100;

export const emailFormSchema = z.object({
  recipients: z
    .array(z.string())
    .transform((emails) =>
      emails.map(parseEmail).filter((email): email is string => email !== null)
    )
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
