import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
  blockPanelOpen: boolean;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  searchFocused,
  blockPanelOpen,
  setSearchFocused,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevPanelOpenRef = useRef(blockPanelOpen);

  useEffect(() => {
    if (searchFocused && inputRef.current) {
      const wasClosed = !prevPanelOpenRef.current && blockPanelOpen;
      if (wasClosed) {
        const timeoutId = setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timeoutId);
      } else {
        inputRef.current.focus();
      }
    }
    prevPanelOpenRef.current = blockPanelOpen;
  }, [searchFocused, blockPanelOpen]);

  return (
    <div className="relative h-7 mb-5">
      <Label className="relative block">
        <Search className="absolute left-3 top-[11px] text-gray-400 h-4 w-4 cursor-text" />
        <Input
          ref={inputRef}
          placeholder="Search blocks..."
          className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </Label>
    </div>
  );
}
