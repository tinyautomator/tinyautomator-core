import { useFormContext } from "react-hook-form";
import {
  EmailFormValues,
  normalizeEmail,
  validateEmail,
} from "./emailValidation";
import { toast } from "sonner";

export function useEmailRecipe() {
  const { setValue, watch } = useFormContext<EmailFormValues>();
  const recipients = watch("recipients");

  const addEmail = (email: string) => {
    if (!validateEmail(email)) {
      toast.error("Invalid email address");
      return;
    }

    const normalized = normalizeEmail(email);
    setValue("recipients", [...recipients, normalized], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateEmail = (oldEmail: string, newEmail: string) => {
    if (!validateEmail(newEmail)) {
      toast.error("Invalid email address");
      return;
    }

    const normalized = normalizeEmail(newEmail);
    if (normalized === oldEmail) return;

    setValue(
      "recipients",
      recipients.map((r) => (r === oldEmail ? normalized : r)),
      { shouldValidate: true }
    );
  };

  const removeEmail = (email: string) => {
    setValue(
      "recipients",
      recipients.filter((r) => r !== email),
      { shouldValidate: true }
    );
  };

  return {
    recipients,
    addEmail,
    updateEmail,
    removeEmail,
  };
}
