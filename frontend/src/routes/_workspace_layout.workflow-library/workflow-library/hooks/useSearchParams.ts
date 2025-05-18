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
    const result = searchParamsSchema.safeParse({
      ...params,
      tags: params.tags ? params.tags.split(",") : [],
    });

    return result.success ? result.data : searchParamsSchema.parse({});
  }, [searchParams]);

  const updateParams = (newParams: Partial<SearchParams>) => {
    const updatedParams = new URLSearchParams(searchParams);

    // Reset page to 1 if any param other than page changes
    if (Object.keys(newParams).some((key) => key !== "page")) {
      updatedParams.set("page", "1");
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (key === "tags" && Array.isArray(value)) {
        if (value.length > 0) {
          updatedParams.set(key, value.join(","));
        } else {
          updatedParams.delete(key);
        }
      } else if (value) {
        updatedParams.set(key, String(value));
      } else {
        updatedParams.delete(key);
      }
    });

    setSearchParams(updatedParams);
  };

  return [validatedParams, updateParams];
}
