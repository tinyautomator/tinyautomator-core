import {
  Calendar,
  Code,
  Database,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import "../../App.css";
import { WORKSPACE_MENU_ITEMS_TO_ICONS } from "./constants";

export default function ({ activeView, setActiveView }) {
  return (
    <Sidebar className="relative flex h-full flex-col justify-between">
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <span className="text-sm font-medium">Workspace</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.keys(WORKSPACE_MENU_ITEMS_TO_ICONS).map((wi) => (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeView === wi}
                    onClick={() => setActiveView(wi)}
                  >
                    {WORKSPACE_MENU_ITEMS_TO_ICONS[wi]}
                    <span>{wi}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="pb-3">Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <MessageSquare className="h-4 w-4" />
                  <span>Slack</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Database className="h-4 w-4" />
                  <span>Spreadsheets</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="h-4 w-4" />
                  <span>Forms</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Code className="h-4 w-4" />
                  <span>Custom Code</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Sparkles className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
