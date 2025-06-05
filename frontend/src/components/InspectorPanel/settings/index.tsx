import { useFlowStore } from "@/components/Canvas/flowStore";
import { EmailSettings } from "./email";
import { ScheduleSettings } from "./schedule";
import { GoogleCalendarEventSettings } from "./google_calendar";

export function SettingsTab() {
  const { getSelectedNode } = useFlowStore();

  const selectedNode = getSelectedNode();
  if (!selectedNode) return null;

  switch (selectedNode.data.nodeType as string) {
    case "send_email":
      return <EmailSettings />;
    case "schedule":
      return <ScheduleSettings />;
    case "google_calendar":
      return <GoogleCalendarEventSettings />;
    default:
      return null;
  }
}
