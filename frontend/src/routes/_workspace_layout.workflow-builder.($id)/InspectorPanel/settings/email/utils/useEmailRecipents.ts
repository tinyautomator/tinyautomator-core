import { useFormContext } from "react-hook-form";
import { EmailFormValues, parseEmail } from "./emailValidation";
import { toast } from "sonner";
import { useMemo } from "react";

export function useEmailRecipients() {
  const {
    setValue,
    getValues,
    formState: { isDirty, isSubmitting },
  } = useFormContext<EmailFormValues>();

  const recipients = getValues("recipients");

  const { validRecipients, invalidRecipients } = useMemo(() => {
    return recipients.reduce(
      (acc, email) => {
        const isValid = parseEmail(email) !== null;
        if (isValid) {
          acc.validRecipients.push(email);
        } else {
          acc.invalidRecipients.push(email);
        }
        return acc;
      },
      { validRecipients: [] as string[], invalidRecipients: [] as string[] }
    );
  }, [recipients]);

  const addEmail = (email: string) => {
    if (!email) return;

    const parsed = parseEmail(email);
    const currentRecipients = getValues("recipients");

    if (currentRecipients.includes(parsed || email)) {
      toast.error(`Email ${parsed || email} has already been added`);
      return;
    }

    setValue("recipients", [...currentRecipients, parsed || email], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const updateEmail = (oldEmail: string, newEmail: string) => {
    if (!newEmail) return;

    const parsed = parseEmail(newEmail);
    const currentRecipients = getValues("recipients");

    if (
      currentRecipients.some(
        (r) => r === (parsed || newEmail) && r !== oldEmail
      )
    ) {
      toast.error("Email already added");
      return;
    }

    setValue(
      "recipients",
      currentRecipients.map((r) => (r === oldEmail ? parsed || newEmail : r)),
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const removeEmail = (email: string) => {
    const currentRecipients = getValues("recipients");
    setValue(
      "recipients",
      currentRecipients.filter((r) => r !== email),
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const validateEmail = (email: string) => {
    const parsed = parseEmail(email);
    return parsed ? parsed : null;
  };

  return {
    // All recipients
    recipients,
    // Categorized recipients
    validRecipients,
    invalidRecipients,
    // Actions
    addEmail,
    updateEmail,
    removeEmail,
    validateEmail,
    // Form state
    isDirty,
    isSubmitting,
  };
}
