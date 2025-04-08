import { BookOpen, LayoutDashboard, Zap } from "lucide-react";
import { JSX } from "react";

export const WORKSPACE_MENU_ITEMS_TO_ICONS: Record<string, JSX.Element> = {
  Dashboard: <LayoutDashboard className="h-4 w-4" />,
  "Workflow Builder": <Zap className="h-4 w-4" />,
  "Workflow Library": <BookOpen className="h-4 w-4" />,
};
