import { EmailIntegrationProvider } from "./EmailIntegrationContext";
import { Footer } from "@/components/email-integration/components/Footer";
import { EmailProviders } from "@/components/email-integration/components/EmailProviders";
import { HowItWorks } from "@/components/email-integration/components/HowItWorks";
import { PageHeader } from "@/components/shared/PageHeader";

export default function EmailIntegration() {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-white border-b px-6 py-4">
        <PageHeader
          title="Email Integration"
          description="Integrate your emails"
        />
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
