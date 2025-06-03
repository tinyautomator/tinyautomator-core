import { create } from "zustand";
import { createCookie } from "react-router";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const themeCookie = createCookie("theme", {
  path: "/",
  maxAge: 31536000,
});

// Get initial theme from cookie
const getInitialTheme = (): Theme => {
  if (typeof document === "undefined") return "light";
  const cookies = document.cookie.split(";");
  const themeCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("theme="),
  );
  return themeCookie ? (themeCookie.split("=")[1] as Theme) : "light";
};

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    set({ theme });
  },
}));
