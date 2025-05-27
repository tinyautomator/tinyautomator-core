import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  scheduleFormSchema,
  type ScheduleFormValues,
} from "./utils/scheduleValidation";
import { ScheduleForm } from "./ScheduleForm";
import { SchedulePreviewModal } from "./SchedulePreviewModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  const handleReset = () => {
    form.reset({
      scheduleType: "once",
      scheduledDate: "",
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
      const fieldOrder = Object.keys(form.getValues());
      const orderedErrors = fieldOrder
        .map((field) => errors[field as keyof ScheduleFormValues]?.message)
        .filter(Boolean);
      orderedErrors.forEach((message) => {
        toast.error(message, {
          duration: 3000,
        });
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
