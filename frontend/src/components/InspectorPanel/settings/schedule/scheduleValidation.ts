import { z } from "zod";
import { combineDateAndTime, getRoundedDownDate } from "./utils";

export enum ScheduleType {
  ONCE = "once",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export type ScheduleFormValues = {
  scheduleType: ScheduleType;
  scheduledDate: Date;
  scheduledTime: string;
};

export const scheduleFormSchema = z
  .object({
    scheduleType: z.nativeEnum(ScheduleType, {
      required_error: "Please select a schedule type",
    }),
    scheduledDate: z.date({
      required_error: "Please select a date",
    }),
    scheduledTime: z.string().min(0, "Please select a time"),
  })
  .superRefine((data, ctx) => {
    const combinedDate = combineDateAndTime(
      data.scheduledDate,
      data.scheduledTime,
    );
    if (
      getRoundedDownDate(data.scheduledDate) < getRoundedDownDate(new Date())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date must be in the future",
        path: ["scheduledDate"],
      });
    }
    if (combinedDate <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Time must be in the future",
        path: ["scheduledTime"],
      });
    }
  });
