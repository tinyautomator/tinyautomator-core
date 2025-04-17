import { useState, useEffect } from "react";

export function usePersistentView(defaultView: string, key = "activeView") {
  const [view, setView] = useState(defaultView);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      if (stored) {
        setView(stored);
      }
    }
  }, [key]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, view);
    }
  }, [view, key]);

  return [view, setView] as const;
}
