const getInitialTheme = () => {
  try {
    const theme =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("theme="))
        ?.split("=")[1] || "light";
    return theme;
  } catch (e) {
    return "light";
  }
};

const theme = getInitialTheme();
document.documentElement.classList.add(theme);
document.documentElement.classList.remove(theme === "dark" ? "light" : "dark");
