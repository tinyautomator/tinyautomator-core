import { BaseApiClient } from "../base";
import { GetCalendarsResponse } from "./types";

export class GoogleCalendarApiClient extends BaseApiClient {
  async getCalendars(): Promise<GetCalendarsResponse> {
    const response = await this.get<GetCalendarsResponse>(
      "/api/google/calendar/list",
    );
    return response;
  }
}
