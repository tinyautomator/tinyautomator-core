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
} from "lucide-react";

export type NodeType = "trigger" | "action";

export const blockCategories = [
  {
    category: "Triggers",
    icon: Zap,
    blocks: [
      {
        action_type: "webhook",
        label: "Webhook",
        icon: Globe,
        node_type: "trigger",
        description: "Trigger a workflow when a webhook is received",
      },
      {
        action_type: "schedule",
        label: "Schedule",
        icon: Calendar,
        node_type: "trigger",
        description: "Start a workflow at specified times or intervals",
        status: "success",
      },
      {
        action_type: "email_trigger",
        label: "Email Received",
        icon: Mail,
        node_type: "trigger",
        description: "Initiate a workflow when a specific email is received",
      },
      {
        action_type: "file_upload",
        label: "File Upload",
        icon: FileText,
        node_type: "trigger",
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
        action_type: "send_email",
        label: "Send Email",
        icon: Mail,
        node_type: "action",
        description: "Compose and send an email as part of the workflow",
        status: "pending",
      },
      {
        action_type: "send_sms",
        label: "Send SMS",
        icon: MessageSquare,
        node_type: "action",
        description: "Send an SMS message to a specified phone number",
        status: "failed",
      },
      {
        action_type: "send_notification",
        label: "Send Notification",
        icon: Bell,
        node_type: "action",
        description: "Dispatch a notification to users or systems",
      },
      {
        action_type: "create_task",
        label: "Create Task",
        icon: FileText,
        node_type: "action",
        description:
          "Generate a new task or to-do item in a task management system",
      },
      {
        action_type: "query_database",
        label: "Query Database",
        icon: Database,
        node_type: "action",
        description: "Execute a database query and retrieve results",
      },
      {
        action_type: "transform_data",
        label: "Transform Data",
        icon: Settings,
        node_type: "action",
        description: "Modify, format, or restructure data within the workflow",
      },
      {
        action_type: "export_csv",
        label: "Export to CSV",
        icon: FileText,
        node_type: "action",
        description: "Convert and save data to a CSV file format",
      },
      {
        action_type: "import_data",
        label: "Import Data",
        icon: Database,
        node_type: "action",
        description: "Load data from external sources into the workflow",
      },
      {
        action_type: "http_request",
        label: "HTTP Request",
        icon: Globe,
        node_type: "action",
        description: "Send an HTTP request to an external API or service",
      },
      {
        action_type: "api_call",
        label: "API Call",
        icon: Globe,
        node_type: "action",
        description: "Make a call to a specific API endpoint",
      },
      {
        action_type: "webhook_send",
        label: "Send Webhook",
        icon: Globe,
        node_type: "action",
        description: "Dispatch a webhook to trigger actions in other systems",
      },
      {
        action_type: "oauth_connect",
        label: "OAuth Connect",
        icon: Shield,
        node_type: "action",
        description:
          "Establish a secure OAuth connection with an external service",
      },
      {
        action_type: "slack_message",
        label: "Slack Message",
        icon: MessageSquare,
        node_type: "action",
        description: "Send a message to a Slack channel or user",
      },
      {
        action_type: "teams_message",
        label: "Teams Message",
        icon: MessageSquare,
        node_type: "action",
        description: "Post a message to a Microsoft Teams channel or chat",
      },
      {
        action_type: "push_notification",
        label: "Push Notification",
        icon: Bell,
        node_type: "action",
        description: "Send a push notification to mobile devices",
      },
      {
        action_type: "in_app_notification",
        label: "In-App Notification",
        icon: Bell,
        node_type: "action",
        description: "Display a notification within the application interface",
      },
      {
        action_type: "create_user",
        label: "Create User",
        icon: Users,
        node_type: "action",
        description: "Add a new user to the system",
      },
      {
        action_type: "update_user",
        label: "Update User",
        icon: Users,
        node_type: "action",
        description: "Modify existing user information",
      },
      {
        action_type: "assign_role",
        label: "Assign Role",
        icon: Shield,
        node_type: "action",
        description: "Assign a specific role or permission to a user",
      },
      {
        action_type: "send_welcome_email",
        label: "Send Welcome Email",
        icon: Mail,
        node_type: "action",
        description:
          "Automatically send a welcome email to newly created users",
      },
      {
        action_type: "track_event",
        label: "Track Event",
        icon: BarChart2,
        node_type: "action",
        description: "Record a specific event or action for analytics purposes",
      },
      {
        action_type: "log_metric",
        label: "Log Metric",
        icon: BarChart2,
        node_type: "action",
        description: "Record a numerical metric or measurement",
      },
      {
        action_type: "generate_report",
        label: "Generate Report",
        icon: FileText,
        node_type: "action",
        description: "Create a comprehensive report based on collected data",
      },
      {
        action_type: "export_analytics",
        label: "Export Analytics",
        icon: Database,
        node_type: "action",
        description: "Export analytics data to an external file or system",
      },
    ],
  },
];

export const actionTypeToBlockMap = blockCategories.reduce(
  (acc, category) => {
    category.blocks.forEach((block) => {
      acc[block.action_type] = block;
    });
    return acc;
  },
  {} as Record<string, (typeof blockCategories)[number]["blocks"][number]>,
);
