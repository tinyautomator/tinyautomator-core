import { Zap, Timer, Mail, Cog, Code } from "lucide-react";

export const blockCategories = [
  {
    name: "Triggers",
    icon: Zap,
    blocks: [{ id: "time-trigger", name: "Time Trigger", icon: Timer }],
  },
  {
    name: "Actions",
    icon: Cog,
    blocks: [{ id: "send-email", name: "Send Email", icon: Mail }],
  },
  {
    name: "Logic",
    icon: Code,
    blocks: [],
  },
];
