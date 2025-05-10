import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Label className="relative block">
        <Search className="absolute left-3 top-[11px] text-gray-400 h-4 w-4 cursor-text" />
        <Input
          placeholder="Search blocks..."
          className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Label>
    </div>
  );
}
