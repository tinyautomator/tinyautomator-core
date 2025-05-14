import { useFlowStore } from "@/routes/_workspace_layout.workflow-builder.($id)/flowStore";
import { EmailSettings } from "./email";

export function SettingsTab() {
  const { selectedNode } = useFlowStore();

  if (!selectedNode) return null;

  switch (selectedNode.data.label as string) {
    case "Send Email":
      return <EmailSettings />;
    default:
      return null;
  }
}
