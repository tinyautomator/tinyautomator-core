import { useFlowStore } from "@/components/Canvas/flowStore";
import { EmailTriggerForm } from "./EmailTriggerForm";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailTriggerDefaultValues,
  EmailTriggerSchema,
  emailTriggerSchema,
} from "./utils/emailTriggerSchema";

export const EmailTrigger = () => {
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();
  const defaultValues = selectedNode?.data.config
    ? (selectedNode?.data.config as Partial<EmailTriggerSchema>)
    : emailTriggerDefaultValues;

  const form = useForm<EmailTriggerSchema>({
    resolver: zodResolver(emailTriggerSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    delayError: 500,
    resetOptions: {
      keepDirty: false,
      keepErrors: false,
    },
    shouldFocusError: true,
  });

  if (!selectedNode) return null;

  return (
    <FormProvider {...form}>
      <EmailTriggerForm />
    </FormProvider>
  );
};
