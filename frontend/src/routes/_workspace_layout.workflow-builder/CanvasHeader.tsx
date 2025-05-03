import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CanvasHeader() {
  return (
    <div className="flex h-12 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter workflow name..."
          className="text-base font-semibold text-slate-800 bg-transparent border border-slate-300 rounded-md px-3 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 hover:border-slate-400 hover:shadow-md transition-all"
        />
        <Badge variant="outline" className="text-xs">
          Draft
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log("saved!")}
        >
          Save
        </Button>
        <Button size="sm">Publish</Button>
      </div>
    </div>
  );
}
