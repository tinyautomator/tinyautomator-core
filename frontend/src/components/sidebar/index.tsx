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
import { WORKSPACE_ITEMS, INTEGRATION_ITEMS, FOOTER_ITEMS } from "./constants";
import { NavLink } from "react-router";

export default function () {
  return (
    <Sidebar
      collapsible="icon"
      className="relative flex h-full flex-col justify-between"
    >
      <SidebarHeader>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {WORKSPACE_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <NavLink to={item.path}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        tooltip={item.label}
                        asChild
                        isActive={isActive}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
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
              {INTEGRATION_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label}>
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {FOOTER_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton tooltip={item.label}>
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
