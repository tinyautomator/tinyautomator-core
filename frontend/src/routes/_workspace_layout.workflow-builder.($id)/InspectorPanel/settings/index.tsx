import { useFlow } from "@/routes/_workspace_layout.workflow-builder.($id)/FlowContext";
import { EmailSettings } from "./email";

export function SettingsTab() {
  const { selectedNode } = useFlow();

  if (!selectedNode) return null;

  switch (selectedNode.data.label as string) {
    case "Send Email":
      return <EmailSettings />;
    default:
      return null;
  }
}
