import {
  // WORKSPACE
  BookOpen,
  LayoutDashboard,
  Zap,
  // INTEGRATION
  Mail,
  Calendar,
  MessageSquare,
  Database,
  FileText,
  Code,

  // FOOTER
  Sparkles,
  Settings,
} from "lucide-react";
import { JSX } from "react";

export const WORKSPACE_ITEMS: {
  label: string;
  icon: JSX.Element;
  path: string;
}[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    path: "/dashboard",
  },
  {
    label: "Workflow Builder",
    icon: <Zap className="h-4 w-4" />,
    path: "/workflow-builder",
  },
  {
    label: "Workflow Library",
    icon: <BookOpen className="h-4 w-4" />,
    path: "/workflow-library",
  },
];

export const INTEGRATION_ITEMS: {
  label: string;
  icon: JSX.Element;
  path: string;
  path: string;
}[] = [
  {
    label: "Email",
    icon: <Mail className="h-4 w-4" />,
    path: "/email-integration",
  },
  {
    label: "Calendar",
    icon: <Calendar className="h-4 w-4" />,
    path: "/dashboard",
  },
  {
    label: "Slack",
    icon: <MessageSquare className="h-4 w-4" />,
    path: "/dashboard",
  },
  {
    label: "Spreadsheets",
    icon: <Database className="h-4 w-4" />,
    path: "/dashboard",
  },
  {
    label: "Forms",
    icon: <FileText className="h-4 w-4" />,
    path: "/dashboard",
  },
  {
    label: "Custom Code",
    icon: <Code className="h-4 w-4" />,
    path: "/dashboard",
  },
];

export const FOOTER_ITEMS = [
  { label: "Settings", icon: <Settings className="h-4 w-4" /> },
  { label: "Upgrade Plan", icon: <Sparkles className="h-4 w-4" /> },
];
