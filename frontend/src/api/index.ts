import { WorkflowApiClient } from "./workflow/client";
import { GmailApiClient } from "./gmail/client";

// Create singleton instances
export const workflowApi = new WorkflowApiClient();
export const gmailApi = new GmailApiClient();

// Export types
export * from "./types";
export * from "./workflow/types";
export * from "./gmail/types";
