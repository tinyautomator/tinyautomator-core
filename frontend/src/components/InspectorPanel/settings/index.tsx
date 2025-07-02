import { useFlowStore } from "@/components/Canvas/flowStore";
import { EmailSettings } from "./email";
import { ScheduleSettings } from "./schedule";
import { GoogleCalendarEventSettings } from "./google_calendar";
import CalendarTriggerSettings from "./calendar_trigger";
import { EmailTrigger } from "./email_trigger";

export function SettingsTab() {
  const { getSelectedNode } = useFlowStore();

  const selectedNode = getSelectedNode();
  if (!selectedNode) return null;

  switch (selectedNode.data.nodeType as string) {
    case "send_email":
      return <EmailSettings />;
    case "schedule":
      return <ScheduleSettings />;
    case "google_calendar_create_event":
      return <GoogleCalendarEventSettings />;
    case "calendar_event":
      return <CalendarTriggerSettings />;
    case "email_trigger":
      return <EmailTrigger />;
    default:
      return null;
  }
}
