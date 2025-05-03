import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
export function Analytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Analytics</CardTitle>
        <CardDescription>
          Performance metrics for your automation workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Meeting Follow-ups</div>
              <div className="text-sm text-muted-foreground">99.3% success</div>
            </div>
            <Progress value={99.3} className="h-2" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Daily Team Digest</div>
              <div className="text-sm text-muted-foreground">100% success</div>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Lead Capture</div>
              <div className="text-sm text-muted-foreground">98.6% success</div>
            </div>
            <Progress value={98.6} className="h-2" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Data Formatting</div>
              <div className="text-sm text-muted-foreground">95.2% success</div>
            </div>
            <Progress value={95.2} className="h-2" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Customer Onboarding</div>
              <div className="text-sm text-muted-foreground">99.5% success</div>
            </div>
            <Progress value={99.5} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
