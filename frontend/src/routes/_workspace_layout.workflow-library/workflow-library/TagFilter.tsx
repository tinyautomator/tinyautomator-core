import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListFilter } from "lucide-react";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { Form } from "react-router";

export function TagFilter() {
  const [{ tags: selectedTags }, updateParams] = useValidatedSearchParams();
  const { tagCounts } = useFilteredWorkflows();
  const [open, setOpen] = useState(false);

  // TODO: Derive this in useFilteredWorkflows...
  const uniqueTags = useMemo(() => {
    return Array.from(tagCounts.keys()).sort(
      (a, b) => tagCounts.get(b)! - tagCounts.get(a)!,
    );
  }, [tagCounts]);
  // TODO: Still stuttering when clearing tags, come back to this.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newTags = Array.from(formData.getAll("tags") as string[]);
    setTimeout(() => setOpen(false), 100);
    updateParams({ tags: newTags });
  };

  const hasSelectedTags = selectedTags && selectedTags.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Tag Filters"
          className={hasSelectedTags ? "bg-slate-100 dark:bg-slate-800" : ""}
        >
          <ListFilter
            size={16}
            strokeWidth={3}
            aria-hidden="true"
            className={
              hasSelectedTags ? "text-slate-900 dark:text-slate-100" : ""
            }
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3 overflow-hidden">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            Tag Filters
          </div>
          <Form method="get" className="space-y-2" onSubmit={handleSubmit}>
            <ScrollArea className="h-[240px] -mx-1 px-1">
              <div className="space-y-2 pr-3">
                {uniqueTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5">
                    <Checkbox
                      id={tag}
                      name="tags"
                      value={tag}
                      defaultChecked={selectedTags?.includes(tag)}
                      className="cursor-pointer h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={tag}
                      className="font-normal flex-1 cursor-pointer text-xs truncate"
                    >
                      {tag}
                    </Label>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] py-0 px-1.5 h-4 min-w-[1.5rem] flex items-center justify-center"
                    >
                      {tagCounts.get(tag) ?? 0}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div
              role="separator"
              aria-orientation="horizontal"
              className="-mx-3 my-1 h-px bg-border"
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                size="sm"
                className="h-7 px-4 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Apply
              </Button>
            </div>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
