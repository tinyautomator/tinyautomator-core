// src/components/Footer.tsx
import { Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FooterProps {
  connectionStatus: "connected" | "not_connected" | "error" | string;
}

export const Footer = ({ connectionStatus }: FooterProps) => {
  return (
    <div className="border-t">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Privacy Note */}
        <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-800 flex items-start gap-2">
          <Shield className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium">Your data stays private</p>
            <p className="mt-1">
              TinyAutomator never stores your email content on our servers. All
              processing happens securely within your workflow.
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            Connection Status
          </div>
          <Progress
            value={connectionStatus === "connected" ? 100 : 0}
            className="h-2 mb-2"
          />
          <div className="flex justify-between text-xs">
            <span>Not Connected</span>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
