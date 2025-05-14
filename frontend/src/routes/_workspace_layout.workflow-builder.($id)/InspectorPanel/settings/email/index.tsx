"use client";

import { useForm, FormProvider } from "react-hook-form";
import { EmailFormValues, emailFormSchema } from "./utils/emailValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "@/components/ui/sonner";

import { EmailForm } from "./EmailForm";
import { EmailPreview } from "./EmailPreview";

export function EmailSettings() {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      recipients: [],
      subject: "",
      message: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    delayError: 500,
    resetOptions: {
      keepDirty: true,
      keepErrors: false,
    },
    shouldFocusError: false,
  });

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <EmailForm />
        <div className="flex justify-end"></div>
        <EmailPreview />
      </div>
<<<<<<< HEAD
      {/* TODO: move this to global app component */}
=======
>>>>>>> 02799ac (feat: send-email block with new inputs and toasts for different ui interactions)
      <Toaster />
    </FormProvider>
  );
}
