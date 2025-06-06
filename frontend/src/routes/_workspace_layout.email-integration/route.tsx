import { EmailIntegrationProvider } from "./EmailIntegrationContext";
import { Footer } from "@/routes/_workspace_layout.email-integration/components/Footer";
import { EmailProviders } from "@/routes/_workspace_layout.email-integration/components/EmailProviders";
import { HowItWorks } from "@/routes/_workspace_layout.email-integration/components/HowItWorks";
import { PageHeader } from "@/components/shared/PageHeader";

export default function EmailIntegration() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-background">
      <div className="bg-white dark:bg-background border-b px-6 py-4">
        <PageHeader title="Email Integration" />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <EmailIntegrationProvider>
          <EmailProviders />
        </EmailIntegrationProvider>
        <HowItWorks />
      </div>
      <Footer />
    </div>
  );
}
