import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  scheduleFormSchema,
  type ScheduleFormValues,
} from "./utils/scheduleValidation";
import { ScheduleForm } from "./ScheduleForm";
import { SchedulePreviewModal } from "./SchedulePreview";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFlowStore } from "@/components/Canvas/flowStore";

export function ScheduleSettings() {
  const { getSelectedNode } = useFlowStore();
  const config = getSelectedNode()?.data?.config as
    | Partial<ScheduleFormValues>
    | undefined;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      scheduleType: config?.scheduleType ?? "once",
      scheduledDate: config?.scheduledDate
        ? new Date(config.scheduledDate)
        : new Date(),
      scheduledTime: config?.scheduledTime ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    delayError: 500,
    shouldFocusError: false,
    resetOptions: { keepDirty: true, keepErrors: false },
  });

  const handleReset = () => {
    form.reset({
      scheduleType: "once",
      scheduledDate: new Date(),
      scheduledTime: "",
    });
    toast.info("Form reset to default values");
  };

  const onSubmit = form.handleSubmit(
    (data) => {
      console.log("Submitting schedule settings data:", data);
      toast.success("Schedule settings saved successfully");
    },
    (errors) => {
      Object.values(errors).forEach((e) => {
        if (e?.message) toast.error(e.message, { duration: 3000 });
      });
    },
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <div className="space-y-6 select-none">
          <ScheduleForm />
        </div>
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
            Save Schedule Settings
          </Button>
        </div>
        <div className="flex justify-start">
          <SchedulePreviewModal />
        </div>
      </form>
    </FormProvider>
  );
}
