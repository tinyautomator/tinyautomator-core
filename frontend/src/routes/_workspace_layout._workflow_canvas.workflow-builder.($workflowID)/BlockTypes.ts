import { LucideIcon } from "lucide-react";

export interface Block {
  category: string;
  node_type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  isFavorite?: boolean;
  status?: string;
}
