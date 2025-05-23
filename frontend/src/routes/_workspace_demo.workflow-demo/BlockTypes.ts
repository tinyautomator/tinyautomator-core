import { LucideIcon } from "lucide-react";

export interface Block {
  action_type: string;
  label: string;
  icon: LucideIcon;
  node_type: string;
  description: string;
  isFavorite?: boolean;
  status?: string;
}
