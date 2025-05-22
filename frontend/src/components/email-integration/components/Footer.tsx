import { PrivacyNote } from '@/components/shared/PrivacyNote';

export const Footer = () => {
  return (
    <div className="border-t">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <PrivacyNote>
          TinyAutomator never stores your email content on our servers. All processing happens
          securely within your workflow.
        </PrivacyNote>
      </div>
    </div>
  );
};
