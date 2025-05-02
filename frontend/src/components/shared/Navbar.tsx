import { HelpCircle, Zap } from "lucide-react";
import { UserButton } from "@clerk/react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  return (
    <header className="flex h-14 items-center border-b bg-white px-6 z-10">
      <SidebarTrigger className="mr-4 -ml-2" />
      <Link
        to="/dashboard"
        className="flex items-center gap-2 font-semibold hover:text-blue-600 active:scale-[0.98]"
        aria-label="Return to Dashboard"
      >
        <Zap className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <span>TinyAutomator</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                window.open("https://docs.tinyautomator.com", "_blank")
              }
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help & Documentation</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={5}>
            Support
          </TooltipContent>
        </Tooltip>
        <UserButton />
      </div>
    </header>
  );
}
