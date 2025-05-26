import { Settings } from "lucide-react";

function GlobalSpinner({ size = "normal" }) {
  const scale = size === "large" ? 2 : 1;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm¬ z-[9999]">
      <div className="relative" style={{ transform: `scale(${scale})` }}>
        <div className="relative animate-[spin_3s_linear_infinite]">
          <Settings className="w-8 h-8 text-purple-600 fill-fuchsia-200" />
        </div>
        <div className="absolute top-2 left-2 animate-[spin_2s_linear_infinite_reverse]">
          <Settings className="w-4 h-4 text-amber-600 fill-orange-200" />
        </div>
      </div>
    </div>
  );
}

export default GlobalSpinner;
