"use client";

import { AlertCircle, Shield, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProviderCard from "./ProviderCard";
import { GmailIcon, OutlookIcon } from "@/components/icons/EmailIcons";
import { useEmailIntegration } from "./hook";

export default function EmailIntegration() {
  const {
    isLoading,
    connectionStatus,
    errorMessage,
    connectGmail,
    disconnectGmail,
  } = useEmailIntegration();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Email Integration</h1>
            <p className="text-sm text-muted-foreground">
              Connect your email accounts
            </p>
          </div>
          <Badge
            className={`border-0 ${
              connectionStatus === "connected"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {connectionStatus === "connected"
              ? "Connected to Gmail"
              : "Not Connected"}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {connectionStatus === "error" && (
          <div className="max-w-xl mx-auto mb-6">
            <Alert
              variant="destructive"
              className="mb-6 flex flex-col items-center text-center space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertTitle className="text-destructive font-semibold">
                  Connection Error
                </AlertTitle>
              </div>
              <AlertDescription className="text-destructive/80 text-sm">
                {errorMessage || "There was an error connecting to Gmail."}
              </AlertDescription>
            </Alert>
          </div>
        )}

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

          {/* How it Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Follow these steps to connect your email account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  [
                    "1",
                    "Click the Connect Button",
                    "Click the 'Connect' button on the provider card to start the authentication process",
                  ],
                  [
                    "2",
                    "Sign in to Your Account",
                    "Sign in to your email account when prompted",
                  ],
                  [
                    "3",
                    "Grant Permissions",
                    "Review and grant the necessary permissions for TinyAutomator",
                  ],
                  [
                    "4",
                    "Start Automating",
                    "Once connected, you can start using your email account in automation workflows",
                  ],
                ].map(([step, title, description]) => (
                  <div key={step} className="flex">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                      <span className="text-sm font-medium">{step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-800 flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium">Your data stays private</p>
              <p className="mt-1">
                TinyAutomator never stores your email content on our servers.
                All processing happens securely within your workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with connection status */}
      <div className="border-t p-4">
        <div className="max-w-5xl mx-auto">
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
}
