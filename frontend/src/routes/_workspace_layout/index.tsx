import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/sidebar";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Route } from "./+types";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/");
  }
}

export default function Layout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen flex-col bg-slate-50">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 min-h-0 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
