export interface CalendarDto {
  id: string;
  summary: string;
  primary?: boolean;
}

export interface GetCalendarsResponse {
  items: CalendarDto[];
}
