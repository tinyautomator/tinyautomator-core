import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WorkflowTagsProps {
  tags: string[];
  className?: string;
}

export function WorkflowTags({ tags, className }: WorkflowTagsProps) {
  return (
    <div
      className={cn(
        "min-h-min max-h-9 flex flex-wrap gap-2 rounded-lg overflow-hidden line-clamp-1",
        className
      )}
    >
      {tags.slice(0, 3).map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className={cn(
            "text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl"
          )}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
