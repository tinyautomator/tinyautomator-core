// components/dash/ViewRenderer.tsx
import Dashboard from "@/components/dashboard";
import WorkflowBuilder from "@/components/workflowbuilder";
import WorkflowLibrary from "@/components/workflowlibrary";
import EmailIntegrationView from "@/components/email-integration";

interface ViewRendererProps {
  activeView: string;
}

export default function ViewRenderer({ activeView }: ViewRendererProps) {
  switch (activeView) {
    case "Dashboard":
      return <Dashboard />;
    case "Workflow Builder":
      return <WorkflowBuilder />;
    case "Workflow Library":
      return <WorkflowLibrary />;
    case "Email":
      return <EmailIntegrationView />;
    default:
      return <Dashboard />;
  }
}
