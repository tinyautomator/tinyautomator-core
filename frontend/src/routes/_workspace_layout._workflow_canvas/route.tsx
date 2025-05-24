import { useSidebar } from "@/components/ui/sidebar";
import { useReactFlow } from "@xyflow/react";
import { createContext, useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";

export const LayoutContext = createContext<{
  toggleBlockPanel: boolean;
  setToggleBlockPanel: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleInspectorPanel: boolean;
  setToggleInspectorPanel: (
    value: boolean | ((prev: boolean) => boolean),
  ) => void;
  searchFocused: boolean;
  setSearchFocused: (value: boolean | ((prev: boolean) => boolean)) => void;
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
} | null>(null);

export default function Layout() {
  const [toggleBlockPanel, setToggleBlockPanel] = useState(true);
  const [toggleInspectorPanel, setToggleInspectorPanel] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const { open, setOpen } = useSidebar();
  const { fitView } = useReactFlow();

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      const isTextInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      if (e.key === "/" && !isTextInput) {
        e.preventDefault();
        setToggleBlockPanel(true);
        setSearchFocused(true);
        setTimeout(() => {
          fitView({
            duration: 500,
            minZoom: 0.5,
            maxZoom: 1.5,
          });
        }, 500);
      } else if (e.key === "f" && !isTextInput) {
        e.preventDefault();
        const isFullscreen = !(
          toggleBlockPanel ||
          toggleInspectorPanel ||
          open
        );

        setOpen(isFullscreen);
        setToggleInspectorPanel(isFullscreen);
        setToggleBlockPanel(isFullscreen);
        setTimeout(() => {
          fitView({
            duration: 500,
            minZoom: 0.5,
            maxZoom: 1.5,
          });
        }, 500);
      }
    },
    [open, toggleBlockPanel, toggleInspectorPanel, fitView, setOpen],
  );

  useEffect(() => {
    setOpen(false);
    setTimeout(() => {
      fitView({
        duration: 500,
        minZoom: 0.5,
        maxZoom: 1.5,
      });
    }, 500);
  }, [fitView, setOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <LayoutContext.Provider
      value={{
        toggleBlockPanel,
        setToggleBlockPanel,
        toggleInspectorPanel,
        setToggleInspectorPanel,
        searchFocused,
        setSearchFocused,
        open,
        setOpen,
      }}
    >
      <Outlet />
    </LayoutContext.Provider>
  );
}
