import { useSearchParams } from "react-router";
import { useMemo } from "react";
import { searchParamsSchema, type SearchParams } from "../utils/schemas";

export function useValidatedSearchParams(
  totalPages = 1,
): [SearchParams, (newParams: Partial<SearchParams>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const validatedParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    const parsed = searchParamsSchema.parse(params);

    parsed.page = Math.max(1, Math.min(parsed.page, totalPages));

    return parsed;
  }, [searchParams, totalPages]);

  const updateParams = (newParams: Partial<SearchParams>) => {
    setSearchParams(
      (prev) => {
        const updatedParams = new URLSearchParams(prev);

        Object.entries(newParams).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") {
            updatedParams.delete(key);
          } else if (key === "tags" && typeof value === "string") {
            updatedParams.set(key, value);
          } else if (key === "tags" && Array.isArray(value)) {
            updatedParams.set(key, value.join(","));
            if (value.length === 0) {
              updatedParams.delete(key);
            }
          } else if (Array.isArray(value)) {
            updatedParams.delete(key);
          } else {
            updatedParams.set(key, String(value));
            if (key !== "page") {
              updatedParams.set("page", "1");
            }
          }
        });

        return updatedParams;
      },
      { preventScrollReset: true },
    );
  };

  return [validatedParams, updateParams];
}
