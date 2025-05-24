import { useContext } from "react";
import { LayoutContext } from "./route";

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayoutContext must be used within LayoutProvider");
  }
  return context;
};
