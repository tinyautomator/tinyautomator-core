import { Settings2 } from "lucide-react";
import ProviderCard from "./EmailProviderCard";
import { GmailIcon, OutlookIcon } from "@/components/icons/EmailIcons";

interface ProvidersProps {
  connectionStatus: string;
  isLoading: boolean;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
}

export const EmailProviders = ({
  connectionStatus,
  isLoading,
  connectGmail,
  disconnectGmail,
}: ProvidersProps) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">Email Providers</h2>
        <p className="text-muted-foreground mb-4">
          Connect your email accounts to integrate them with your automation
          workflows
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <ProviderCard
          name="Gmail"
          description="Connect your Gmail account to automate email workflows"
          icon={GmailIcon}
          isConnected={connectionStatus === "connected"}
          isLoading={isLoading}
          onConnect={connectGmail}
          onDisconnect={disconnectGmail}
        />
        <ProviderCard
          name="Outlook"
          description="Connect your Microsoft Outlook account (Coming Soon)"
          icon={OutlookIcon}
          isConnected={false}
          isDisabled={true}
        />
        <ProviderCard
          name="Custom SMTP"
          description="Connect any email provider with SMTP settings (Coming Soon)"
          icon={<Settings2 className="h-5 w-5 text-purple-600" />}
          isConnected={false}
          isDisabled={true}
        />
      </div>
    </div>
  );
};
