import EmailProviderCard from './EmailProviderCard';
import { GmailIcon } from '@/components/icons/EmailIcons';

import { useEmailIntegrationContext } from '@/components/email-integration/EmailIntegrationContext';

export const EmailProviders = () => {
  const { connectGmail, isLoading } = useEmailIntegrationContext();

  return (
    <div className="max-w-5xl mx-auto ">
      <div className="mb-6 flex justify-center items-center">
        <h2 className="text-lg font-bold mb-4">Email Providers</h2>
      </div>

      <div className="flex justify-center items-center gap-2 mb-8">
        <EmailProviderCard
          icon={GmailIcon}
          name="Gmail"
          description="Connect your Gmail account to automate email workflows"
          onConnect={connectGmail}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
