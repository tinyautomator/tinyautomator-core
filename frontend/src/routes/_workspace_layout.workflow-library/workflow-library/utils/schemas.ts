// TODO : Improve this schema for better validation and error handling

import { z } from "zod";

// Tab types with const assertion for type safety
export const TAB_VALUES = ["active", "draft", "templates", "archived"] as const;
export type Tab = (typeof TAB_VALUES)[number];

// Schema definitions
export const searchParamsSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.toLowerCase().trim() : undefined))
    .catch(""),

  tab: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(TAB_VALUES))
    .catch("active"),

  tags: z
    .preprocess(
      (val) => (typeof val === "string" ? val.split(",").filter(Boolean) : val),
      z.array(z.string().trim().min(1))
    )
    .default([]),

  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((val) => val > 0, "Page must be positive")
    .transform(String)
    .catch("1"),
});

// Type exports
export type SearchParams = z.infer<typeof searchParamsSchema>;
