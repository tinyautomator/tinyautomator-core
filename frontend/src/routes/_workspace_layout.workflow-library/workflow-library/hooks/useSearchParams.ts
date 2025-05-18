import { useSearchParams } from "react-router";
import { useMemo } from "react";
import { searchParamsSchema, type SearchParams } from "../utils/schemas";

export function useValidatedSearchParams(): [
  SearchParams,
  (newParams: Partial<SearchParams>) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();

  const validatedParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return searchParamsSchema.parse(params);
  }, [searchParams]);

  const updateParams = (newParams: Partial<SearchParams>) => {
    setSearchParams(
      (prev) => {
        // Reset to page 1 if any param other than page changes
        if (Object.keys(newParams).some((key) => key !== "page")) {
          prev.set("page", "1");
        }

        // Update params
        Object.entries(newParams).forEach(([key, value]) => {
          if (key === "tags" && Array.isArray(value)) {
            if (value.length > 0) {
              prev.set(key, value.join(","));
            } else {
              prev.delete(key);
            }
          } else if (value) {
            prev.set(key, String(value));
          } else {
            prev.delete(key);
          }
        });

        return prev;
      },
      { preventScrollReset: true }
    );
  };

  return [validatedParams, updateParams];
}
