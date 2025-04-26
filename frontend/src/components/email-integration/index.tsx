"use client";

import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Footer } from "@/components/email-integration/components/Footer";
import { Providers } from "@/components/email-integration/components/Providers";
import { HowItWorks } from "@/components/email-integration/components/HowItWorks";
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

        <Providers
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
