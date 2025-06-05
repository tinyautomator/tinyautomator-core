import { useForm, FormProvider } from "react-hook-form";
import {
  CalendarFormValues,
  calendarFormSchema,
} from "./utils/calendarValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarForm } from "./CalendarForm";
import { CalendarPreview } from "./CalendarPreview";
import { useFlowStore } from "@/components/Canvas/flowStore";

export function GoogleCalendarEventSettings() {
  const { getSelectedNode } = useFlowStore();
  const selectedNode = getSelectedNode();

  const formDefaultValues = {
    summary: "",
    description: "",
    location: "",
    startDate: { dateTime: "" },
    endDate: { dateTime: "" },
    reminders: true,
  };

  const defaultValues =
    Object.keys(selectedNode?.data.config || {}).length === 0
      ? formDefaultValues
      : selectedNode?.data.config;

  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: defaultValues as CalendarFormValues,
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
        <CalendarForm />
        <CalendarPreview />
      </div>
    </FormProvider>
  );
}
