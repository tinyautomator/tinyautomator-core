import { z } from "zod";

const now = new Date();
now.setHours(0, 0, 0, 0);

export const scheduleFormSchema = z.object({
  scheduleType: z.enum(["once", "daily", "weekly", "monthly"], {
    required_error: "Please select a schedule type",
  }),
  scheduledDate: z
    .date({
      required_error: "Please select a date",
    })
    .refine((date) => date >= now, {
      message: "Date must be in the future",
    }),
  scheduledTime: z.string().min(0, "Please select a time"),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
