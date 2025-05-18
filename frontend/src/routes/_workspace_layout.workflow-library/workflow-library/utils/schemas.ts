import { z } from "zod";

// Tab types
export const TAB_VALUES = ["active", "draft", "templates", "archived"] as const;

// Schema definitions
export const searchParamsSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.toLowerCase().trim() : undefined))
    .catch(""),

  tab: z
    .preprocess((val) => String(val).toLowerCase(), z.enum(TAB_VALUES))
    .catch("active"),

  tags: z.string().array().default([]),

  page: z.string().regex(/^\d+$/).default("1"),
});

// Type exports
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type Tab = (typeof TAB_VALUES)[number];
