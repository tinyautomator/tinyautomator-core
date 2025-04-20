"use client";

import type { Node } from "@xyflow/react";

import { EmailSettingsSection } from "./email/EmailSettingsSection";
import { TimeTriggerSettingsSection } from "./time-trigger/TimeTriggerSettingsSection";

interface SettingsTabProps {
  node: Node<{ label: string }>;
}

export default function SettingsTab({ node }: SettingsTabProps) {
  return (
    <div className="space-y-4">
      {node.data.label === "Send Email" && <EmailSettingsSection />}
      {node.data.label === "Time Trigger" && <TimeTriggerSettingsSection />}
    </div>
  );
}
