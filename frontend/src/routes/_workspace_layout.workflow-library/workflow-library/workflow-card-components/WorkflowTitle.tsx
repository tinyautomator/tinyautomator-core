import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { TEXT_SLATE_DARK_SLATE_200 } from "./workflow-card.constants";
import { useState } from "react";

interface WorkflowTitleProps {
  title: string;
  isArchived: boolean;
  isFavorite: boolean;
}

interface WorkflowFavoriteProps {
  isFavorite: boolean;
}

function WorkflowFavorite({ isFavorite }: WorkflowFavoriteProps) {
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  const handleFavorite = () => {
    setLocalIsFavorite((prev) => !prev);
    // TODO: Update the workflow in the database
    console.log("Favorite", !localIsFavorite);
  };

  return (
    <button
      className={cn("mr-2 text-xl cursor-pointer absolute left-1")}
      onClick={handleFavorite}
    >
      <Star
        className={cn(
          "text-xl cursor-pointer transition-colors duration-300 ease-in-out",
          localIsFavorite
            ? "text-yellow-300 fill-yellow-200"
            : "text-slate-400 hover:text-yellow-300 hover:fill-white"
        )}
      />
    </button>
  );
}

export function WorkflowTitle({
  title,
  isArchived,
  isFavorite,
}: WorkflowTitleProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-lg w-full justify-center relative"
      )}
    >
      {!isArchived && <WorkflowFavorite isFavorite={isFavorite} />}
      <h3
        className={cn(
          "font-bold text-md text-ellipsis w-6/10 text-balance text-center leading-tight line-clamp-2 ",
          "group-hover:text-blue-600",
          "border-slate-200 dark:border-slate-800",
          isArchived
            ? "text-slate-500 dark:text-slate-400"
            : TEXT_SLATE_DARK_SLATE_200
        )}
        title={title}
      >
        {title}
      </h3>
    </div>
  );
}
