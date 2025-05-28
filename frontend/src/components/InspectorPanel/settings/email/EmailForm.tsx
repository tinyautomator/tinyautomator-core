import { useFormContext } from "react-hook-form";
import { EmailFormValues } from "./utils/emailValidation";
import { EmailSubjectField } from "./EmailSubjectField";
import { EmailBodyField } from "./EmailBodyField";
import { RecipientInputSection } from "./RecipientSection";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function EmailForm() {
  const { reset, handleSubmit, getValues, control } =
    useFormContext<EmailFormValues>();

  const onSubmit = handleSubmit(
    (data) => {
      console.log("Submitting email settings data:", data);
      toast.success("Email settings saved successfully");
    },
    (errors) => {
      const fieldOrder = Object.keys(getValues());

      const orderedErrors = fieldOrder
        .map((field) => errors[field as keyof EmailFormValues]?.message)
        .filter(Boolean);

      orderedErrors.forEach((message) => {
        toast.error(message, {
          duration: 3000,
        });
      });
    }
  );

  const handleReset = () => {
    reset({
      recipients: [],
      subject: "",
      message: "",
    });
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

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          Reset
        </Button>
        <Button type="submit" className="flex-1">
          Save Email Settings
        </Button>
      </div>
    </form>
  );
}
