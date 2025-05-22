import { RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type ProviderCardProps = {
  icon: React.ReactNode;
  name: string;
  description: string;
  onConnect?: () => Promise<void>;
  isLoading?: boolean;
};

export default function EmailProviderCard({
  icon,
  name,
  description,
  onConnect,
  isLoading = false,
}: ProviderCardProps) {
  return (
    <Card>
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
        </div>

        <Button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full gap-2 transition-all duration-200 hover:scale-105 hover:brightness-105 active:scale-95"
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
      </CardContent>
    </Card>
  );
}
