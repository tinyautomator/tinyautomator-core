"use client";

import { useForm, FormProvider } from "react-hook-form";
import { EmailFormValues, emailFormSchema } from "./utils/emailValidation";
import { zodResolver } from "@hookform/resolvers/zod";

import { EmailForm } from "./EmailForm";
import { EmailPreview } from "./EmailPreview";

export function EmailSettingsSection() {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      recipients: [],
      subject: "",
      message: "",
    },
    mode: "onChange",
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <EmailForm />
        <div className="flex justify-end"></div>
        <EmailPreview />
      </div>
    </FormProvider>
  );
}
