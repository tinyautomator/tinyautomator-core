export function getTimeZoneAbbreviation(): string | null {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = formatter.formatToParts(new Date());
    return parts.find((part) => part.type === "timeZoneName")?.value ?? null;
  } catch {
    return null;
  }
}
