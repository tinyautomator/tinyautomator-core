import {
  addDays,
  addMonths,
  addWeeks,
  format,
  addMinutes,
  setMinutes,
  setHours,
  parse,
  isValid,
} from "date-fns";
import { ScheduleType } from "./scheduleValidation";

export const MINUTE_OPTIONS = ["00", "10", "20", "30", "40", "50"];

export function getTimeZoneAbbreviation(date: Date): string | null {
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(date);
    return parts.find((part) => part.type === "timeZoneName")?.value ?? null;
  } catch {
    console.error("Failed to get time zone abbreviation", date);
    return null;
  }
}

export function getNextHalfHour(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const roundedMinutes = Math.ceil(minutes / 30) * 30;
  let roundedHours = hours;

  if (roundedMinutes === 60) {
    roundedHours = (hours + 1) % 24;
    return `${roundedHours.toString().padStart(2, "0")}:00`;
  }

  return `${roundedHours.toString().padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;
}

export function combineDateAndTime(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  newDate.setHours(hours, minutes);
  return newDate;
}

export function getNextRuns(
  scheduleType: ScheduleType,
  scheduledDate: Date,
  scheduledTime: string,
) {
  if (!scheduleType || !scheduledDate || !scheduledTime) {
    return [];
  }

  const dateTimeString = `${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`;
  const baseDate = new Date(dateTimeString);
  const runs: Date[] = [];

  if (scheduleType === ScheduleType.ONCE) {
    return [baseDate];
  }

  for (let i = 0; i < 3; i++) {
    let runDate = baseDate;
    switch (scheduleType) {
      case ScheduleType.DAILY:
        runDate = addDays(baseDate, i);
        break;
      case ScheduleType.WEEKLY:
        runDate = addWeeks(baseDate, i);
        break;
      case ScheduleType.MONTHLY:
        runDate = addMonths(baseDate, i);
        break;
    }
    runs.push(runDate);
  }

  return runs;
}

export function getScheduleDescription(
  scheduleType: ScheduleType,
  scheduledDate: Date,
  scheduledTime: string,
) {
  if (!scheduleType || !scheduledDate || !scheduledTime) {
    return "Complete the form to see schedule preview";
  }

  const dateTimeString = `${format(scheduledDate, "yyyy-MM-dd")}T${scheduledTime}`;
  const date = new Date(dateTimeString);

  const formattedDate = format(date, "P");
  const formattedTime = format(date, "p");

  switch (scheduleType) {
    case ScheduleType.ONCE: {
      return `Run once on ${formattedDate} at ${formattedTime}`;
    }
    case ScheduleType.DAILY: {
      return `Run daily at ${formattedTime}, starting ${formattedDate}`;
    }
    case ScheduleType.WEEKLY: {
      const dayName = format(date, "EEEE");
      return `Run weekly on ${dayName}s at ${formattedTime}, starting ${formattedDate}`;
    }
    case ScheduleType.MONTHLY: {
      const dayOfMonth = format(date, "do");
      return `Run monthly on the ${dayOfMonth} at ${formattedTime}, starting ${formattedDate}`;
    }
    default:
      return "Invalid schedule configuration";
  }
}

export function getRoundedDownDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateTo12HourParts(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return {
    hour: hour12.toString().padStart(2, "0"),
    minute: m.toString().padStart(2, "0"),
    period,
  };
}

export function getTimePartsFromValue(value: string, offset: number = 0) {
  if (!value) {
    const now = addMinutes(new Date(), offset);
    const m = now.getMinutes();
    const minuteOption =
      MINUTE_OPTIONS.find((opt) => parseInt(opt) >= m) || MINUTE_OPTIONS[0];
    let rounded = setMinutes(now, parseInt(minuteOption));

    if (parseInt(minuteOption) < m) {
      rounded = setHours(rounded, rounded.getHours() + 1);
    }
    const parts = dateTo12HourParts(rounded);
    return {
      hour: parts.hour,
      minute: minuteOption,
      period: parts.period,
    };
  }

  const parsed = parse(value, "HH:mm", new Date());

  if (!isValid(parsed)) {
    const now = addMinutes(new Date(), offset);
    const m = now.getMinutes();
    const minuteOption =
      MINUTE_OPTIONS.find((opt) => parseInt(opt) >= m) || MINUTE_OPTIONS[0];
    let rounded = setMinutes(now, parseInt(minuteOption));
    if (parseInt(minuteOption) < m) {
      rounded = setHours(rounded, rounded.getHours() + 1);
    }
    const parts = dateTo12HourParts(rounded);
    return {
      hour: parts.hour,
      minute: minuteOption,
      period: parts.period,
    };
  }
  const parts = dateTo12HourParts(parsed);

  return parts;
}
