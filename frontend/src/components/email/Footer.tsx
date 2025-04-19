import { Progress } from "@/components/ui/progress";
import { PrivacyNote } from "../shared/PrivacyNote";

interface FooterProps {
  connectionStatus: "connected" | "not_connected" | "error" | string;
}

export const Footer = ({ connectionStatus }: FooterProps) => {
  return (
    <div className="border-t">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <PrivacyNote>
          TinyAutomator never stores your email content on our servers. All
          processing happens securely within your workflow.
        </PrivacyNote>

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
