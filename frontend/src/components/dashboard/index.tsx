import {
  CheckCircle,
  Clock,
  LineChart,
  Play,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import "../../App.css";

export default function () {
  return (
    <div className="h-full overflow-auto p-6 scrollbar-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your automation workflows.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workflows
            </CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              +24% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5 hrs</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <LineChart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="recent">Recent Runs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Workflow Cards */}
            <WorkflowCard
              title="Meeting Follow-ups"
              description="Send follow-up emails after calendar events with 'sales call' tag"
              lastRun="2 hours ago"
              status="active"
              runs={142}
              successRate={99.3}
            />
            <WorkflowCard
              title="Daily Team Digest"
              description="Send Slack summary of important messages and emails at 9 AM"
              lastRun="Today at 9:00 AM"
              status="active"
              runs={65}
              successRate={100}
            />
            <WorkflowCard
              title="Lead Capture"
              description="Add form submissions to Google Sheets"
              lastRun="12 minutes ago"
              status="active"
              runs={287}
              successRate={98.6}
            />
            <WorkflowCard
              title="Data Formatting"
              description="Format email data and upload to FTP server nightly"
              lastRun="Yesterday at 11:00 PM"
              status="active"
              runs={42}
              successRate={95.2}
            />
            <WorkflowCard
              title="Customer Onboarding"
              description="Send welcome emails and setup guides to new customers"
              lastRun="1 hour ago"
              status="active"
              runs={189}
              successRate={99.5}
            />
            <WorkflowCard
              title="Social Media Posts"
              description="Schedule and post content across platforms"
              lastRun="3 hours ago"
              status="paused"
              runs={76}
              successRate={97.8}
            />
          </div>
        </TabsContent>
        <TabsContent value="recent">
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
                  <div className="text-sm text-muted-foreground">
                    Today, 2:15 PM
                  </div>
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
                  <div className="text-sm text-muted-foreground">
                    Today, 1:42 PM
                  </div>
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
                  <div className="text-sm text-muted-foreground">
                    Today, 9:00 AM
                  </div>
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
        </TabsContent>
        <TabsContent value="analytics">
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
                    <div className="text-sm font-medium">
                      Meeting Follow-ups
                    </div>
                    <div className="text-sm text-muted-foreground">
                      99.3% success
                    </div>
                  </div>
                  <Progress value={99.3} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Daily Team Digest</div>
                    <div className="text-sm text-muted-foreground">
                      100% success
                    </div>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Lead Capture</div>
                    <div className="text-sm text-muted-foreground">
                      98.6% success
                    </div>
                  </div>
                  <Progress value={98.6} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">Data Formatting</div>
                    <div className="text-sm text-muted-foreground">
                      95.2% success
                    </div>
                  </div>
                  <Progress value={95.2} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Customer Onboarding
                    </div>
                    <div className="text-sm text-muted-foreground">
                      99.5% success
                    </div>
                  </div>
                  <Progress value={99.5} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkflowCard({
  title,
  description,
  lastRun,
  status,
  runs,
  successRate,
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={status === "active" ? "default" : "outline"}>
            {status === "active" ? "Active" : "Paused"}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Last run: {lastRun}</div>
          <div className="font-medium">{runs} runs</div>
        </div>
        <div className="mt-2">
          <Progress value={successRate} className="h-1" />
          <div className="mt-1 text-xs text-right text-muted-foreground">
            {successRate}% success
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full justify-between">
          <Button variant="outline" size="sm">
            <Play className="mr-1 h-3 w-3" />
            Run Now
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="mr-1 h-3 w-3" />
            Configure
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
