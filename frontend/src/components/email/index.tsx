"use client";

import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/email/components/Footer";
import { EmailProviders } from "@/components/email/components/EmailProviders";
import { HowItWorks } from "@/components/email/components/HowItWorks";
import { useEmailIntegration } from "./hook";
import { ErrorAlert } from "../shared/ErrorAlert";

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
            <ErrorAlert
              title="Connection Error"
              message={
                errorMessage || "There was an error connecting to Gmail."
              }
              centered
            />
          </div>
        )}

        <EmailProviders
          connectionStatus={connectionStatus}
          isLoading={isLoading}
          connectGmail={connectGmail}
          disconnectGmail={disconnectGmail}
        />

        <HowItWorks />
      </div>

      <Footer connectionStatus={connectionStatus} />
    </div>
  );
}
