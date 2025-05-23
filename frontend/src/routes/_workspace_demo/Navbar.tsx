import { HelpCircle, Zap } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  return (
    <header className="flex h-14 items-center border-b bg-white px-6 z-10">
      <Link
        to="/dashboard"
        className="flex items-center gap-2 font-semibold hover:text-blue-600 active:scale-[0.98] group"
        aria-label="Return to Dashboard"
      >
        <div className="relative">
          <Zap
            className="h-5 w-5 text-blue-600 transition-opacity opacity-100 group-hover:opacity-0 absolute"
            aria-hidden="true"
          />
          <Zap
            className="h-5 w-5 text-blue-600 transition-opacity opacity-0 group-hover:opacity-100"
            aria-hidden="true"
            fill="currentColor"
          />
        </div>
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
              <span className="sr-only">Support</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={5}>
            Support
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
