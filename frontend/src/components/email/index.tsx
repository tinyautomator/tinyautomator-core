"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  RefreshCw,
  Trash2,
  Shield,
  CheckCircle2,
  ExternalLink,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GmailIcon, OutlookIcon } from "@/components/icons/EmailIcons";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function () {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connected" | "error"
  >("disconnected");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user is already connected
    const checkConnectionStatus = async () => {
      // This would be replaced with actual API call to check connection status
      // For now, we'll assume disconnected
      setConnectionStatus("disconnected");
    };

    checkConnectionStatus();
  }, []);

  const handleConnectGmail = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/integrations/gmail/auth-url");
      const data = await response.json();

      if (data.url) {
        console.log(authUrl);
        setAuthUrl(data.url);
        // Open the auth URL in a new window
        window.open(data.url, "_blank");
      } else {
        throw new Error("Failed to get authentication URL");
      }
    } catch (error) {
      setConnectionStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);

    try {
      // This would be an actual API call to disconnect
      // await fetch('/api/integrations/gmail/disconnect', { method: 'POST' })
      setConnectionStatus("disconnected");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to disconnect",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          {connectionStatus === "connected" ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
              Connected to Gmail
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-0"
            >
              Not Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {connectionStatus === "error" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                "There was an error connecting to Gmail. Please try again."}
            </AlertDescription>
          </Alert>
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
              onConnect={handleConnectGmail}
              onDisconnect={handleDisconnect}
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

          {connectionStatus === "connected" && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Connected Accounts</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-bold mr-2">
                          Gmail Connected
                        </h3>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                          Active
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Your Gmail account is connected and ready to use
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Account
                          </div>
                          <div className="font-medium">user@gmail.com</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Connected On
                          </div>
                          <div className="font-medium">April 16, 2025</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Token Expires
                          </div>
                          <div className="font-medium">In 29 days</div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleDisconnect}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {connectionStatus !== "connected" && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>
                  Follow these steps to connect your email account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Click the Connect Button</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the "Connect" button on the provider card to start
                        the authentication process
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Sign in to Your Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Sign in to your email account when prompted
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Grant Permissions</h4>
                      <p className="text-sm text-muted-foreground">
                        Review and grant the necessary permissions for
                        TinyAutomator
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                      <span className="text-sm font-medium">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Start Automating</h4>
                      <p className="text-sm text-muted-foreground">
                        Once connected, you can start using your email account
                        in automation workflows
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

function ProviderCard({
  name,
  description,
  icon,
  isConnected,
  isDisabled = false,
  isLoading = false,
  onConnect,
  onDisconnect,
}: {
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onConnect?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}) {
  return (
    <Card className={isDisabled ? "opacity-70" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {isConnected && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        </div>

        {isConnected ? (
          <Button
            variant="outline"
            onClick={onDisconnect}
            disabled={isDisabled || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Disconnect
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            disabled={isDisabled || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
