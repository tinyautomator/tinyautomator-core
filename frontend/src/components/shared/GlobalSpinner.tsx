import { Settings } from "lucide-react";

function GlobalSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-[9999]">
      <div className="relative bottom-8 left-3.5 animate-[spin_4s_linear_infinite]">
        <Settings className="w-8 h-8 text-purple-600 fill-white" />
      </div>
      <div className="animate-[spin_4s_linear_infinite_reverse]">
        <Settings className="w-16 h-16 text-gray-6bnv00 fill-white" />
      </div>
      <div className="relative top-8 right-3.5 animate-[spin_4s_linear_infinite]">
        <Settings className="w-8 h-8 text-amber-600 fill-white" />
      </div>
    </div>
  );
}

export default GlobalSpinner;
