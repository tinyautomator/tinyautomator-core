import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Recent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workflow Runs</CardTitle>
        <CardDescription>
          History of your workflow executions in the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Meeting Follow-ups</p>
                <p className="text-xs text-muted-foreground">
                  Completed in 1.2s
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Today, 2:15 PM</div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Lead Capture</p>
                <p className="text-xs text-muted-foreground">
                  Completed in 0.8s
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Today, 1:42 PM</div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Daily Team Digest</p>
                <p className="text-xs text-muted-foreground">
                  Completed in 3.5s
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Today, 9:00 AM</div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">Data Formatting</p>
                <p className="text-xs text-muted-foreground">
                  Failed - Timeout error
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Yesterday, 11:00 PM
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Customer Onboarding</p>
                <p className="text-xs text-muted-foreground">
                  Completed in 2.1s
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Yesterday, 4:30 PM
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
