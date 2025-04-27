import { Zap } from "lucide-react";
import { UserButton } from "@clerk/react-router";

export default function Navbar() {
  return (
    <header className="flex h-14 items-center border-b bg-white px-6 z-10">
      <div className="flex items-center gap-2 font-semibold">
        <Zap className="h-5 w-5 text-blue-600" />
        <span>TinyAutomator</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserButton />
      </div>
    </header>
  );
}
