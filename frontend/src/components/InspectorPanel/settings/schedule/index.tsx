import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  scheduleFormSchema,
  type ScheduleFormValues,
} from "./scheduleValidation";
import { ScheduleForm } from "./ScheduleForm";
import { SchedulePreviewModal } from "./SchedulePreview";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFlowStore } from "@/components/Canvas/flowStore";
import { combineDateAndTime, getNextHalfHour } from "./utils";
import { ScheduleType } from "./scheduleValidation";

export function ScheduleSettings() {
  const { getSelectedNode } = useFlowStore();
  const now = new Date();
  let formValues = {
    scheduleType: ScheduleType.ONCE,
    scheduledDate: now,
    scheduledTime: getNextHalfHour(now),
  };

  const config = getSelectedNode()?.data?.config as ScheduleFormValues;

  if (Object.keys(config).length !== 0) {
    // TODO: should we validate the config is valid?
    const configDate = new Date(config.scheduledDate);
    formValues = {
      scheduleType: config.scheduleType as ScheduleType,
      scheduledDate: configDate,
      scheduledTime: format(configDate, "HH:mm"),
    };
  }

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: formValues,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    delayError: 500,
    shouldFocusError: false,
    resetOptions: { keepDirty: true, keepErrors: false },
  });

  const handleReset = () => {
    const resetDate = new Date();
    form.reset({
      scheduleType: ScheduleType.ONCE,
      scheduledDate: resetDate,
      scheduledTime: getNextHalfHour(resetDate),
    });
    toast.info("Form reset to default values");
  };

  const onSubmit = form.handleSubmit(
    (data) => {
      const node = getSelectedNode();
      if (node) {
        node.data.config = {
          scheduleType: data.scheduleType,
          scheduledDate: combineDateAndTime(
            data.scheduledDate,
            data.scheduledTime,
          ).toISOString(),
        };
      }
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
          <ScheduleForm now={now} />
        </div>
        <div className="flex gap-2 mt-6">
          <SchedulePreviewModal />
          <Button
            className="w-24"
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button className="flex-1" type="submit">
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
