import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowCard } from "@/components/dashboard/WorkFlowCard";
import { Recent } from "@/components/dashboard/Recent";
import { Analytics } from "@/components/dashboard/Analytics";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active Workflows</TabsTrigger>
        <TabsTrigger value="recent">Recent Runs</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.title} {...workflow} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="recent">
        <Recent />
      </TabsContent>

      <TabsContent value="analytics">
        <Analytics />
      </TabsContent>
    </Tabs>
  );
}

const workflows = [
  {
    title: "Meeting Follow-ups",
    description:
      "Send follow-up emails after calendar events with 'sales call' tag",
    lastRun: "2 hours ago",
    status: "active",
    runs: 142,
  },
  {
    title: "Daily Team Digest",
    description: "Send Slack summary of important messages and emails at 9 AM",
    lastRun: "Today at 9:00 AM",
    status: "active",
    runs: 65,
  },
  {
    title: "Lead Capture",
    description: "Add form submissions to Google Sheets",
    lastRun: "12 minutes ago",
    status: "active",
    runs: 287,
  },
  {
    title: "Data Formatting",
    description: "Format email data and upload to FTP server nightly",
    lastRun: "Yesterday at 11:00 PM",
    status: "active",
    runs: 42,
  },
  {
    title: "Customer Onboarding",
    description: "Send welcome emails and setup guides to new customers",
    lastRun: "1 hour ago",
    status: "active",
    runs: 189,
  },
  {
    title: "Social Media Posts",
    description: "Schedule and post content across platforms",
    lastRun: "3 hours ago",
    status: "paused",
    runs: 76,
  },
];
