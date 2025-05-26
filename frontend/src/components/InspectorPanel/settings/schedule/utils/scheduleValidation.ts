import { z } from "zod";

export const scheduleFormSchema = z.object({
  scheduleType: z.enum(["once", "daily", "weekly", "monthly"], {
    required_error: "Please select a schedule type",
  }),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
