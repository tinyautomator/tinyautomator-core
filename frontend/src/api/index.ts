import { WorkflowApiClient } from "./workflow/client";
import { GmailApiClient } from "./gmail/client";
import { GoogleCalendarApiClient } from "./google_calendar/client";

// Create singleton instances
export const workflowApi = new WorkflowApiClient();
export const gmailApi = new GmailApiClient();
export const googleCalendarApi = new GoogleCalendarApiClient();

// Export types
export * from "./types";
export * from "./workflow/types";
export * from "./gmail/types";
export * from "./google_calendar/types";
