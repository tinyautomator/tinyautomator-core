import { useFormContext } from "react-hook-form";
import { EmailFormValues, validateEmail } from "./utils/emailValidation";
import { EmailSubjectField } from "./EmailSubjectField";
import { EmailBodyField } from "./EmailBodyField";
import { RecipientInputSection } from "./RecipientSection";

import { Button } from "@/components/ui/button";
export function EmailForm() {
  const { handleSubmit } = useFormContext<EmailFormValues>();

  const onSubmit = (data: EmailFormValues) => {
    const validRecipients = data.recipients.filter((email) =>
      validateEmail(email),
    );

    const cleanedData = { ...data, recipients: validRecipients };
    console.log("Submitting cleaned data:", cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <RecipientInputSection />
      <EmailSubjectField />
      <EmailBodyField />
      <Button type="submit" className="w-full">
        Save Email Settings
      </Button>
    </form>
  );
}
