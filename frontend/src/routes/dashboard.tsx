import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
// import "reactflow/dist/style.css";

import { TooltipProvider } from "@/components/ui/tooltip";
import { UserButton } from "@clerk/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import WorkflowBuilder from "@/components/workflow";
import EmailIntegrationView from "@/components/email";

export default function Dash() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <h1>Loading...</h1>;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen flex-col bg-slate-50">
          {/* Navbar */}
          <header className="flex h-14 items-center border-b bg-white px-6 z-10">
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>TinyAutomator</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <UserButton />
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-1 overflow-hidden">
              {activeView === "Dashboard" && <Dashboard />}
              {activeView === "Workflow Builder" && <WorkflowBuilder />}
              {activeView == "Email" && <EmailIntegrationView />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
