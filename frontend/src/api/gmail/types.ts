export interface GmailAuthUrlResponse {
  url: string;
}

export interface SendEmailDto {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
}

export interface SendEmailResponse {
  messageId: string;
  threadId: string;
}

export interface Label {
  id: string;
  name: string;
}

export interface LabelListResponse {
  labels: Label[];
}
