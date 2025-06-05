import { z } from "zod";
import { parseISO, isBefore } from "date-fns";

const MAX_SUMMARY_CHAR_COUNT = 100;
const MAX_DESCRIPTION_CHAR_COUNT = 1000;
const MAX_LOCATION_CHAR_COUNT = 200;

const isValidDateTime = (data: { date?: string; dateTime?: string }) =>
  !!data.date || !!data.dateTime;

const isStartBeforeEnd = (
  start: { date?: string; dateTime?: string },
  end: { date?: string; dateTime?: string },
) => {
  if ((!start.date && !start.dateTime) || (!end.date && !end.dateTime))
    return true;
  const startDate = start.dateTime
    ? parseISO(start.dateTime)
    : parseISO(start.date!);
  const endDate = end.dateTime ? parseISO(end.dateTime) : parseISO(end.date!);
  return (
    isBefore(startDate, endDate) || startDate.getTime() === endDate.getTime()
  );
};

const eventDateTimeSchema = z.object({
  date: z.string().optional(),
  dateTime: z.string().optional(),
});

export const calendarFormSchema = z
  .object({
    summary: z
      .string()
      .max(MAX_SUMMARY_CHAR_COUNT, {
        message: `Summary must be under ${MAX_SUMMARY_CHAR_COUNT} characters`,
      })
      .optional(),

    description: z
      .string()
      .max(MAX_DESCRIPTION_CHAR_COUNT, {
        message: `Description must be under ${MAX_DESCRIPTION_CHAR_COUNT} characters`,
      })
      .optional(),

    location: z
      .string()
      .max(MAX_LOCATION_CHAR_COUNT, {
        message: `Location must be under ${MAX_LOCATION_CHAR_COUNT} characters`,
      })
      .optional(),

    startDate: eventDateTimeSchema.refine(isValidDateTime, {
      message: "Start date is required",
    }),

    endDate: eventDateTimeSchema.refine(isValidDateTime, {
      message: "End date is required",
    }),

    reminders: z.boolean().optional(),
  })
  .refine((data) => isStartBeforeEnd(data.startDate, data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type CalendarFormValues = z.infer<typeof calendarFormSchema>;
