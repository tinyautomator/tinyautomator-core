import { RefreshCw, Trash2, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ProviderCardProps = {
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  onConnect?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
};

export default function ProviderCard({
  name,
  description,
  icon,
  isConnected,
  isDisabled = false,
  isLoading = false,
  onConnect,
  onDisconnect,
}: ProviderCardProps) {
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
