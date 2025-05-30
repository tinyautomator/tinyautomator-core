import { useFormContext } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";
import { EmailSubjectField } from "./EmailSubjectField";
import { EmailBodyField } from "./EmailBodyField";
import { RecipientInputSection } from "./RecipientSection";
import { toast } from "sonner";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFlowStore } from "@/components/Canvas/flowStore";

import { FormControls } from "@/components/shared/FormControls";

export function EmailForm() {
  const { reset, handleSubmit, getValues, control } =
    useFormContext<EmailFormValues>();
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();
  const onSubmit = handleSubmit(
    (data) => {
      if (!selectedNode) return;
      selectedNode.data.config = data;
      toast.success("Email settings saved successfully");
    },
    (errors) => {
      const fieldOrder = Object.keys(getValues());
      fieldOrder.forEach((field) => {
        const message = errors[field as keyof EmailFormValues]?.message;
        if (message) {
          toast.error(message);
        }
      });
    },
  );

  const handleReset = () => {
    reset({ recipients: [], subject: "", message: "" });
    toast.info("Email settings reset");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormField
        control={control}
        name="recipients"
        render={({ field }) => (
          <FormItem>
            <RecipientInputSection {...field} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="subject"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <EmailSubjectField {...field} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Message</FormLabel>
            <EmailBodyField {...field} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormControls handleReset={handleReset} text="email" />
    </form>
  );
}
