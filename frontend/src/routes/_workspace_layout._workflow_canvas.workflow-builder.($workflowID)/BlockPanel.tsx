import { useState } from "react";
import {
  Search,
  Star,
  ChevronDown,
  ChevronRight,
  Clock,
  LucideIcon,
  Rocket,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { blockCategories } from "@/components/shared/BlockCategories";
import { SearchBar } from "./SearchBar";
import { Block } from "./BlockTypes";
import { useFlowStore } from "../../components/Canvas/flowStore";

interface BlockCategory {
  category: string;
  icon: LucideIcon;
  blocks: Block[];
  expanded?: boolean;
}

interface ViewModeToggleProps {
  viewMode: "default" | "compact";
  onViewModeChange: (mode: "default" | "compact") => void;
}

function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="ghost"
        className={`px-2 py-1 text-xs h-7 rounded ${viewMode === "default" ? "bg-blue-100 text-blue-800 pointer-events-none hover:bg-transparent" : ""}`}
        onClick={() => onViewModeChange("default")}
      >
        Default
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={`px-2 py-1 text-xs h-7 rounded ${viewMode === "compact" ? "bg-blue-100 text-blue-800 pointer-events-none hover:bg-transparent" : ""}`}
        onClick={() => onViewModeChange("compact")}
      >
        Compact
      </Button>
    </div>
  );
}

interface BlockItemProps {
  block: Block;
  categoryName: string;
  viewMode: "default" | "compact";
  isFavorite: boolean;
  onToggleFavorite: (node_type: string, categoryName: string) => void;
  onBlockUsed?: (block: Block) => void;
}

function BlockItem({
  block,
  categoryName,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onBlockUsed,
}: BlockItemProps) {
  const handleUse = () => {
    if (onBlockUsed) onBlockUsed(block);
  };

  // Determine icon color based on category
  const iconColor =
    categoryName.toLowerCase() === "triggers"
      ? "text-amber-600"
      : categoryName.toLowerCase() === "actions"
        ? "text-purple-600"
        : "text-gray-600";

  return (
    <div
      key={block.node_type}
      className={`group flex items-start p-3 rounded-md cursor-grab active:cursor-grabbing transition-all hover:bg-gray-100 dark:hover:bg-accent ${viewMode === "compact" ? "py-2" : "py-3"}`}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/reactflow",
          JSON.stringify({
            category: block.category,
            nodeType: block.node_type,
          }),
        );
        event.dataTransfer.effectAllowed = "move";
      }}
      onClick={handleUse}
    >
      <div className={`mr-3 flex-shrink-0 p-1.5 rounded`}>
        <block.icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className={`flex-grow ${viewMode === "compact" ? "text-sm" : ""}`}>
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{block.label}</p>
        </div>
        {viewMode !== "compact" && (
          <p className="text-xs text-gray-500  dark:text-gray-400 mt-0.5">
            {block.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100 ${isFavorite ? "text-yellow-500" : "text-gray-400"}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(block.node_type, categoryName);
        }}
      >
        <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
      </Button>
    </div>
  );
}

interface BlockCategoryProps {
  category: BlockCategory;
  onToggleCategory: (category: string) => void;
  renderBlock: (block: Block, categoryName: string) => React.ReactNode;
  icon?: React.ReactNode;
}

function BlockCategory({
  category,
  onToggleCategory,
  renderBlock,
  icon,
}: BlockCategoryProps) {
  if (category.blocks.length === 0) return null;

  return (
    <div
      key={category.category}
      className="mb-2 dark:text-secondary-foreground"
    >
      <Button
        variant="ghost"
        className="w-full justify-between text-sm font-medium"
        onClick={() => onToggleCategory(category.category)}
      >
        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-secondary-foreground">
          {category.expanded ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          {icon}
          {category.category}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-300">
          {category.blocks.length}
        </span>
      </Button>
      {category.expanded && (
        <div className="mt-1 space-y-1">
          {category.blocks.map((block) =>
            renderBlock(block, category.category),
          )}
        </div>
      )}
    </div>
  );
}

interface BlockSectionProps {
  title: string;
  icon: React.ReactNode;
  blocks: Block[];
  categoryName: string;
  renderBlock: (block: Block, categoryName: string) => React.ReactNode;
  showSeparator?: boolean;
  onClear?: () => void;
}

function BlockSection({
  title,
  icon,
  blocks,
  categoryName,
  renderBlock,
  showSeparator = true,
  onClear,
}: BlockSectionProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-secondary-foreground">
        {icon} {title}
        <div className="flex-1" />
        {onClear && (
          <button
            className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors underline"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            title="Clear Recently Used"
            type="button"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-1 space-y-1">
        {blocks.map((block) => renderBlock(block, categoryName))}
      </div>
      {showSeparator && <Separator className="my-2" />}
    </div>
  );
}

interface NoResultsProps {
  searchQuery: string;
}

function NoResults({ searchQuery }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <Search className="h-8 w-8 text-gray-400 mb-2" />
      <p className="text-gray-500">No blocks found matching "{searchQuery}"</p>
    </div>
  );
}

function KeyboardShortcut() {
  return (
    <div className="text-xs text-gray-500 flex items-center">
      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 mr-1">
        /
      </kbd>
      to search
    </div>
  );
}

interface BlockPanelHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: "default" | "compact";
  onViewModeChange: (mode: "default" | "compact") => void;
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
}

function BlockPanelHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  searchFocused,
  setSearchFocused,
  blockPanelOpen,
}: BlockPanelHeaderProps & {
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
  blockPanelOpen: boolean;
}) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-accent">
      <h2 className="text-lg font-semibold mb-2">Blocks</h2>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        blockPanelOpen={blockPanelOpen}
      />
      <div className="flex justify-between mt-3">
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        <KeyboardShortcut />
      </div>
    </div>
  );
}

export default function BlockPanel({
  searchFocused,
  setSearchFocused,
  blockPanelOpen,
}: {
  searchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
  blockPanelOpen: boolean;
}) {
  const { getRecentlyUsed, clearRecentlyUsed } = useFlowStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"default" | "compact">("default");
  const [categories, setCategories] =
    useState<BlockCategory[]>(blockCategories);

  const [favorites, setFavorites] = useState<Block[]>([]);

  const toggleCategory = (c: string) => {
    setCategories(
      categories.map((category) =>
        category.category === c
          ? { ...category, expanded: !category.expanded }
          : category,
      ),
    );
  };

  const toggleFavorite = (node_type: string, categoryName: string) => {
    const category = categories.find((c) => c.category === categoryName);
    if (!category) return;
    const block = category.blocks.find((b) => b.node_type === node_type);
    if (!block) return;
    if (favorites.some((f) => f.node_type === node_type)) {
      setFavorites(favorites.filter((f) => f.node_type !== node_type));
    } else {
      setFavorites([...favorites, block]);
    }
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      blocks: category.blocks.filter(
        (block) =>
          block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          block.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.blocks.length > 0);

  const isBlockFavorite = (node_type: string) =>
    favorites.some((f) => f.node_type === node_type);

  const renderBlock = (block: Block, categoryName: string) => (
    <BlockItem
      key={block.node_type}
      block={block}
      categoryName={categoryName}
      viewMode={viewMode}
      isFavorite={isBlockFavorite(block.node_type)}
      onToggleFavorite={toggleFavorite}
    />
  );

  const getBlockCategoryName = (block: Block): string => {
    const found = categories.find((cat) =>
      cat.blocks.some((b) => b.node_type === block.node_type),
    );
    return found ? found.category : "recent";
  };

  return (
    <div className="h-full w-64 flex flex-col bg-white dark:bg-tertiary border-r border-gray-200 dark:border-accent">
      <BlockPanelHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        blockPanelOpen={blockPanelOpen}
      />
      <ScrollArea className="flex-grow overflow-y-auto p-3">
        <BlockSection
          title="Favorites"
          icon={
            <Star
              className="w-4 h-4 mr-2 text-yellow-500"
              fill="currentColor"
            />
          }
          blocks={favorites}
          categoryName="favorites"
          renderBlock={renderBlock}
        />
        {!searchQuery && (
          <BlockSection
            title="Recently Used"
            icon={<Clock className="w-4 h-4 mr-2" />}
            blocks={getRecentlyUsed()}
            categoryName="recent"
            renderBlock={(block) =>
              renderBlock(block, getBlockCategoryName(block))
            }
            onClear={clearRecentlyUsed}
          />
        )}
        {filteredCategories.map((category) => {
          let icon = undefined;
          const cat = category.category.toLowerCase();
          if (cat === "triggers")
            icon = <Rocket className="w-4 h-4 mr-2 text-amber-600" />;
          else if (cat === "actions")
            icon = <Cog className="w-4 h-4 mr-2 text-purple-600" />;

          return (
            <BlockCategory
              key={category.category}
              category={category}
              onToggleCategory={toggleCategory}
              renderBlock={renderBlock}
              icon={icon}
            />
          );
        })}
        {filteredCategories.length === 0 && (
          <NoResults searchQuery={searchQuery} />
        )}
      </ScrollArea>
    </div>
  );
}
