import { useFlowStore } from "@/components/Canvas/flowStore";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarTriggerSchema,
  calendarTriggerDefaultValues,
  calendarTriggerFormSchema,
  CalendarTriggerFormSchema,
} from "./utils/calendarTriggerSchema";
import { CalendarTriggerForm } from "./CalendarTriggerForm";

export default function CalendarTriggerSettings() {
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();

  const defaultValues: CalendarTriggerFormSchema =
    Object.keys(selectedNode?.data.config || {}).length === 0
      ? calendarTriggerDefaultValues
      : (selectedNode?.data.config as CalendarTriggerSchema);

  const form = useForm<CalendarTriggerFormSchema>({
    resolver: zodResolver(calendarTriggerFormSchema),
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

  return (
    <FormProvider {...form}>
      <CalendarTriggerForm />
    </FormProvider>
  );
}
