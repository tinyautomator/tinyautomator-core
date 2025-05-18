import { useEffect, useState } from "react";

export function useOptimisticParamValue<T>(valueFromRouter: T) {
  const [localValue, setLocalValue] = useState(valueFromRouter);

  useEffect(() => {
    setLocalValue(valueFromRouter);
  }, [valueFromRouter]);

  return [localValue, setLocalValue] as const;
}
