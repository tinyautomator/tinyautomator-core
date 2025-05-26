import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  scheduleFormSchema,
  type ScheduleFormValues,
} from "./utils/scheduleValidation";
import { ScheduleForm } from "./ScheduleForm";
import { SchedulePreviewModal } from "./SchedulePreviewModal";

export function ScheduleSettings() {
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      scheduleType: "once",
      scheduledDate: "",
      scheduledTime: "",
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
        <ScheduleForm />
        <div className="flex justify-start">
          <SchedulePreviewModal />
        </div>
      </div>
    </FormProvider>
  );
}
