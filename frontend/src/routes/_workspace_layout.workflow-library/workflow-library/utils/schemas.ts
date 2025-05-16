import { z } from "zod";
import { useSearchParams } from "react-router";

// Tab types
export const TAB_VALUES = ["active", "draft", "templates", "archived"] as const;

// Schema definitions
const searchParamsSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.toLowerCase().trim() : undefined))
    .catch(""),

  tab: z
    .preprocess((val) => String(val).toLowerCase(), z.enum(TAB_VALUES))
    .catch("active"),

  tags: z
    .string()
    .optional()
    .transform((val) =>
      val?.trim()
        ? val
            .split(",")
            .filter(Boolean)
            .map((tag) => tag.trim())
        : []
    )
    .catch([]),
});

// Type exports
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type Tab = (typeof TAB_VALUES)[number];

// Custom hook for validated search params
export function useValidatedSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get and validate current params
  const params = searchParamsSchema.parse({
    q: searchParams.get("q"),
    tab: searchParams.get("tab"),
    tags: searchParams.get("tags"),
  });

  // Simple update function that uses the schema
  const updateParams = (updates: Partial<SearchParams>) => {
    const currentParams = {
      q: searchParams.get("q"),
      tab: searchParams.get("tab") ?? "active",
      tags: searchParams.get("tags"),
    };

    // Merge and validate
    const newParams = searchParamsSchema.parse({
      ...currentParams,
      ...updates,
    });

    // Update URL - only include params if they have values
    const urlParams = {
      tab: newParams.tab,
      ...(newParams.q ? { q: newParams.q } : {}),
      ...(newParams.tags?.length ? { tags: newParams.tags.join(",") } : {}),
    };

    setSearchParams(urlParams);
  };

  return [params, updateParams] as const;
}
