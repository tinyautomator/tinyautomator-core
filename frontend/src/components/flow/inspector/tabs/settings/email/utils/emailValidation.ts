import { z } from "zod";

export const emailSchema = z.string().email();

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email.trim()).success;
}

export const MAX_MESSAGE_CHAR_COUNT = 2500;

export const emailFormSchema = z.object({
  recipients: z
    .array(z.string())
    .min(1, { message: "At least one recipient is required" }),
  subject: z
    .string()
    .min(1, { message: "Subject is required" })
    .max(100, { message: "Subject must be under 100 characters" }),
  message: z
    .string()
    .min(1, { message: "Message body is required" })
    .max(MAX_MESSAGE_CHAR_COUNT, {
      message: `Message must be under ${MAX_MESSAGE_CHAR_COUNT} characters`,
    }),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;
