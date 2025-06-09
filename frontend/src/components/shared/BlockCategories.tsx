import {
  Cog,
  Mail,
  Database,
  Globe,
  Bell,
  FileText,
  Calendar,
  Settings,
  Users,
  MessageSquare,
  Zap,
  Shield,
  BarChart2,
  CalendarClock,
} from "lucide-react";

export type Category = "trigger" | "action";

export const blockCategories = [
  {
    category: "Triggers",
    icon: Zap,
    blocks: [
      {
        category: "trigger",
        node_type: "schedule",
        label: "Schedule",
        icon: Calendar,
        description: "Start a workflow at specified times or intervals",
        status: "success",
      },
      {
        category: "trigger",
        node_type: "calendar_event",
        label: "Google Calendar Event",
        icon: CalendarClock,
        description: "Trigger a workflow when a calendar event occurs",
      },
      {
        category: "trigger",
        node_type: "webhook",
        label: "Webhook",
        icon: Globe,
        description: "Trigger a workflow when a webhook is received",
      },
      {
        category: "trigger",
        node_type: "email_trigger",
        label: "Email Received",
        icon: Mail,
        description: "Initiate a workflow when a specific email is received",
      },
      {
        category: "trigger",
        node_type: "file_upload",
        label: "File Upload",
        icon: FileText,
        description:
          "Begin a workflow when a file is uploaded to a specified location",
      },
    ],
  },
  {
    category: "Actions",
    icon: Cog,
    blocks: [
      {
        category: "action",
        node_type: "send_email",
        label: "Send Email",
        icon: Mail,
        description: "Compose and send an email as part of the workflow",
        status: "pending",
      },
      {
        category: "action",
        node_type: "google_calendar_create_event",
        label: "Create Google Calendar Event",
        icon: Calendar,
        description: "Create a Google Calendar event as part of the workflow",
      },
      {
        category: "action",
        node_type: "send_sms",
        label: "Send SMS",
        icon: MessageSquare,
        description: "Send an SMS message to a specified phone number",
        status: "failed",
      },
      {
        category: "action",
        node_type: "send_notification",
        label: "Send Notification",
        icon: Bell,
        description: "Dispatch a notification to users or systems",
      },
      {
        category: "action",
        node_type: "create_task",
        label: "Create Task",
        icon: FileText,
        description:
          "Generate a new task or to-do item in a task management system",
      },
      {
        category: "action",
        node_type: "query_database",
        label: "Query Database",
        icon: Database,
        description: "Execute a database query and retrieve results",
      },
      {
        category: "action",
        node_type: "transform_data",
        label: "Transform Data",
        icon: Settings,
        description: "Modify, format, or restructure data within the workflow",
      },
      {
        category: "action",
        node_type: "export_csv",
        label: "Export to CSV",
        icon: FileText,
        description: "Convert and save data to a CSV file format",
      },
      {
        category: "action",
        node_type: "import_data",
        label: "Import Data",
        icon: Database,
        description: "Load data from external sources into the workflow",
      },
      {
        category: "action",
        node_type: "http_request",
        label: "HTTP Request",
        icon: Globe,
        description: "Send an HTTP request to an external API or service",
      },
      {
        category: "action",
        node_type: "api_call",
        label: "API Call",
        icon: Globe,
        description: "Make a call to a specific API endpoint",
      },
      {
        category: "action",
        node_type: "webhook_send",
        label: "Send Webhook",
        icon: Globe,
        description: "Dispatch a webhook to trigger actions in other systems",
      },
      {
        category: "action",
        node_type: "oauth_connect",
        label: "OAuth Connect",
        icon: Shield,
        description:
          "Establish a secure OAuth connection with an external service",
      },
      {
        category: "action",
        node_type: "slack_message",
        label: "Slack Message",
        icon: MessageSquare,
        description: "Send a message to a Slack channel or user",
      },
      {
        category: "action",
        node_type: "teams_message",
        label: "Teams Message",
        icon: MessageSquare,
        description: "Post a message to a Microsoft Teams channel or chat",
      },
      {
        category: "action",
        node_type: "push_notification",
        label: "Push Notification",
        icon: Bell,
        description: "Send a push notification to mobile devices",
      },
      {
        category: "action",
        node_type: "in_app_notification",
        label: "In-App Notification",
        icon: Bell,
        description: "Display a notification within the application interface",
      },
      {
        category: "action",
        node_type: "create_user",
        label: "Create User",
        icon: Users,
        description: "Add a new user to the system",
      },
      {
        category: "action",
        node_type: "update_user",
        label: "Update User",
        icon: Users,
        description: "Modify existing user information",
      },
      {
        category: "action",
        node_type: "assign_role",
        label: "Assign Role",
        icon: Shield,
        description: "Assign a specific role or permission to a user",
      },
      {
        category: "action",
        node_type: "send_welcome_email",
        label: "Send Welcome Email",
        icon: Mail,
        description:
          "Automatically send a welcome email to newly created users",
      },
      {
        category: "action",
        node_type: "track_event",
        label: "Track Event",
        icon: BarChart2,
        description: "Record a specific event or action for analytics purposes",
      },
      {
        category: "action",
        node_type: "log_metric",
        label: "Log Metric",
        icon: BarChart2,
        description: "Record a numerical metric or measurement",
      },
      {
        category: "action",
        node_type: "generate_report",
        label: "Generate Report",
        icon: FileText,
        description: "Create a comprehensive report based on collected data",
      },
      {
        category: "action",
        node_type: "export_analytics",
        label: "Export Analytics",
        icon: Database,
        description: "Export analytics data to an external file or system",
      },
    ],
  },
];

export const nodeTypeToBlockMap = blockCategories.reduce(
  (acc, category) => {
    category.blocks.forEach((block) => {
      acc[block.node_type] = block;
    });
    return acc;
  },
  {} as Record<string, (typeof blockCategories)[number]["blocks"][number]>,
);
