import { useForm, FormProvider } from "react-hook-form";
import { EmailFormValues, emailFormSchema } from "./utils/emailValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailForm } from "./EmailForm";
import { EmailPreview } from "./EmailPreview";
import { useFlowStore } from "@/components/Canvas/flowStore";

export function EmailSettings() {
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();

  const formDefaultValues = {
    recipients: [],
    subject: "",
    message: "",
  };
  const defaultValues =
    Object.keys(selectedNode?.data.config || {}).length === 0
      ? formDefaultValues
      : selectedNode?.data.config;
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: defaultValues as EmailFormValues,
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
      <div className="flex flex-col gap-4">
        <EmailForm />
        <EmailPreview />
      </div>
    </FormProvider>
  );
}
