import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Settings, Play } from "lucide-react";

interface ButtonsOnHoverProps {
  onEdit: () => void;
  onRun: () => void;
}

export function ButtonsOnHover({ onEdit, onRun }: ButtonsOnHoverProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-white/95 to-transparent px-5 pt-10 pb-5 gap-2",
        "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300"
      )}
    >
      <Button
        size="sm"
        variant="outline"
        className={cn(
          "flex-1 text-blue-700 hover:bg-blue-50 pointer-events-auto"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Settings className="h-3.5 w-3.5 mr-1.5" /> Edit
      </Button>
      <Button
        size="sm"
        variant="default"
        className={cn(
          "flex-1 bg-blue-600 hover:bg-blue-700 pointer-events-auto"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onRun();
        }}
      >
        <Play className="h-3.5 w-3.5 mr-1.5" /> Run
      </Button>
    </div>
  );
}
