import { z } from "zod";

export const TAB_VALUES = ["active", "draft", "templates", "archived"] as const;
export type Tab = (typeof TAB_VALUES)[number];

export const searchParamsSchema = z.object({
  q: z.string().optional().default(""),

  tab: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(TAB_VALUES))
    .catch("active"),

  tags: z
    .preprocess(
      (val) => (typeof val === "string" ? val.split(",").filter(Boolean) : val),
      z.array(z.string().trim().min(1)),
    )
    .default([]),

  page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10))
    .catch(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
