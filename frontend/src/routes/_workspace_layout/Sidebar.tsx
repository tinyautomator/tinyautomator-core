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
      className="relative flex h-full flex-col justify-between  dark:bg-secondary"
    >
      <SidebarHeader className="dark:bg-secondary">
        <SidebarGroupLabel aria-label="Workspace Section">
          Workspace
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent className="scrollbar-hidden dark:bg-secondary">
        <SidebarGroup className="h-30">
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
                        className="active:scale-[0.99] !cursor-default dark"
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
                  <NavLink to={item.path}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        tooltip={item.label}
                        asChild
                        isActive={isActive}
                        className="active:scale-[0.99] !cursor-default"
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
      </SidebarContent>

      <SidebarFooter className="dark:bg-secondary">
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
