import { useSidebar } from "@/components/ui/sidebar";
import { ReactFlowProvider } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";

export interface LayoutActions {
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
}

export default function Layout() {
  const [toggleBlockPanel, setToggleBlockPanel] = useState(true);
  const [toggleInspectorPanel, setToggleInspectorPanel] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const { open, setOpen } = useSidebar();

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setOpen(false);
      initialized.current = true;
    }
  }, [setOpen]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      const isTextInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement;

      if (e.key === "/" && !isTextInput) {
        e.preventDefault();
        setToggleBlockPanel(true);
        setSearchFocused(true);
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
      }
    },
    [open, toggleBlockPanel, toggleInspectorPanel, setOpen],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const layoutContext: LayoutActions = {
    toggleBlockPanel,
    setToggleBlockPanel,
    toggleInspectorPanel,
    setToggleInspectorPanel,
    searchFocused,
    setSearchFocused,
    open,
    setOpen,
  };

  return (
    <ReactFlowProvider>
      <Outlet context={layoutContext} />
    </ReactFlowProvider>
  );
}
