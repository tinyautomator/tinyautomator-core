export type TimeUnit = "minute" | "hour" | "day" | "week";

export const timeUnitToMinutes: Record<TimeUnit, number> = {
  minute: 1,
  hour: 60,
  day: 60 * 24,
  week: 60 * 24 * 7,
};

export function convertToMinutes(amount: number, unit: TimeUnit): number {
  return amount * timeUnitToMinutes[unit];
}

export function convertFromMinutes(minutes: number): {
  amount: number;
  unit: TimeUnit;
} {
  if (minutes === 0) return { amount: 0, unit: "minute" };

  const units: TimeUnit[] = ["week", "day", "hour", "minute"];
  for (const unit of units) {
    if (minutes % timeUnitToMinutes[unit] === 0) {
      return { amount: minutes / timeUnitToMinutes[unit], unit };
    }
  }

  return { amount: minutes, unit: "minute" };
}
