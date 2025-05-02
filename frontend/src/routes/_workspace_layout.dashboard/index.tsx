import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/sidebar";
import ViewRenderer from "@/components/dashboard/viewRenderer";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Route } from "./+types";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/");
  }
}

export default function Dash() {
  const [activeView, setActiveView] = useLocalStorage(
    "activeView",
    "Dashboard",
  );

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen flex-col bg-slate-50">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-1 min-h-0 overflow-auto">
              <ViewRenderer activeView={activeView} />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
