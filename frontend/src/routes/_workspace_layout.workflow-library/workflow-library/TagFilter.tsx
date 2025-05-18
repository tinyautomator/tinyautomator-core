import { useValidatedSearchParams } from "./hooks/useSearchParams";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilter } from "lucide-react";
import { useFilteredWorkflows } from "./hooks/useFilteredWorkflows";
import { Form } from "react-router";

export function TagFilter() {
  const [{ tags: selectedTags }, updateParams] = useValidatedSearchParams();
  const { tagCounts } = useFilteredWorkflows();
  const [open, setOpen] = useState(false);

  // Get unique tags from tagCounts
  const uniqueTags = useMemo(() => {
    return Array.from(tagCounts.keys()).sort();
  }, [tagCounts]);

  const handleClear = () => {
    updateParams({ tags: [] });
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newTags = Array.from(formData.getAll("tags") as string[]);
    updateParams({ tags: newTags });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Tag Filters">
          <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            Tag Filters
          </div>
          <Form method="get" className="space-y-3" onSubmit={handleSubmit}>
            {uniqueTags.map((tag) => (
              <div key={tag} className="flex items-center gap-2">
                <Checkbox
                  id={tag}
                  name="tags"
                  value={tag}
                  defaultChecked={selectedTags?.includes(tag)}
                  className="cursor-pointer"
                />
                <Label
                  htmlFor={tag}
                  className="font-normal flex-1 cursor-pointer"
                >
                  {tag}
                </Label>
                <Badge variant="secondary" className="ml-auto">
                  {tagCounts.get(tag) ?? 0}
                </Badge>
              </div>
            ))}
            <div
              role="separator"
              aria-orientation="horizontal"
              className="-mx-3 my-1 h-px bg-border"
            />
            <div className="flex justify-between gap-2">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-7 px-2"
              >
                Apply
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
