import { z } from "zod";

const emailSchema = z.string().email();

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email.trim()).success;
}
