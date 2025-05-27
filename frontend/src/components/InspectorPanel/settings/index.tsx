import { useFlowStore } from "@/components/Canvas/flowStore";
import { EmailSettings } from "./email";
import { ScheduleSettings } from "./schedule";

export function SettingsTab() {
  const { getSelectedNode } = useFlowStore();

  const selectedNode = getSelectedNode();
  if (!selectedNode) return null;

  switch (selectedNode.data.nodeType as string) {
    case "send_email":
      return <EmailSettings />;
    case "schedule":
      return <ScheduleSettings />;
    default:
      return null;
  }
}
