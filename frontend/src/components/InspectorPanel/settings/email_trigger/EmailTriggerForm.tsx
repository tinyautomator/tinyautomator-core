import { useFormContext, useWatch } from "react-hook-form";
import {
  EmailTriggerSchema,
  emailTriggerDefaultValues,
} from "./utils/emailTriggerSchema";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormControls } from "@/components/shared/FormControls";
import { toast } from "sonner";
import { useFlowStore } from "@/components/Canvas/flowStore";

import LabelSelector from "./LabelSelector";

export const EmailTriggerForm = () => {
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();
  const form = useFormContext<EmailTriggerSchema>();
  const historyType = useWatch({ name: "historyType", control: form.control });

  const onSubmit = (data: EmailTriggerSchema) => {
    if (!selectedNode) return;
    selectedNode.data.config = data;
    console.log(data);
    toast.success("Email trigger settings saved");
  };

  const onReset = () => {
    form.reset(emailTriggerDefaultValues);
    if (!selectedNode) return;
    selectedNode.data.config = emailTriggerDefaultValues;
    toast.info("Email trigger settings reset");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="historyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Action</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={historyType ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="messageAdded">Message Added</SelectItem>
                    <SelectItem value="messageDeleted">
                      Message Deleted
                    </SelectItem>
                    <SelectItem value="labelAdded">Label Added</SelectItem>
                    <SelectItem value="labelDeleted">Label Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="labelIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label IDs</FormLabel>
              <FormControl>
                <LabelSelector field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormControls handleReset={onReset} text="email trigger" />
      </form>
    </Form>
  );
};
