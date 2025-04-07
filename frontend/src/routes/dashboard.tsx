import { useState } from "react";
import { Plus, Zap } from "lucide-react";
//import "reactflow/dist/style.css"

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/appSidebar/appSidebar";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col bg-slate-50">
          {/* Navbar */}
          <header className="flex h-14 items-center border-b bg-white px-6 z-10">
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>TinyAutomator</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Workflow
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-1 overflow-hidden">
              {activeView === "dashboard" && <Dashboard />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
