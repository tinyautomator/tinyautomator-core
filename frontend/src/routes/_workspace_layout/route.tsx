import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, redirect } from "react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { Route } from "./+types/route";
import { Toaster } from "@/components/ui/sonner";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/");
  }
}

export default function Layout() {
  return (
    <TooltipProvider>
      <Toaster />
      <SidebarProvider>
        <div className="flex flex-col h-screen w-screen bg-slate-50">
          <Navbar />
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            <main className="flex-1 min-h-0 h-full">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
