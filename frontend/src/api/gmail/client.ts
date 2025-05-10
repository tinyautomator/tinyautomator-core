import { BaseApiClient } from "../base";
import { GmailAuthUrlResponse, SendEmailDto, SendEmailResponse } from "./types";

export class GmailApiClient extends BaseApiClient {
  async getAuthUrl(): Promise<GmailAuthUrlResponse> {
    const response = await this.get<GmailAuthUrlResponse>(
      "/api/integrations/gmail/auth-url",
    );
    return response;
  }

  async handleCallback(): Promise<void> {
    await this.get<void>("/api/integrations/gmail/callback");
  }

  async sendEmail(data: SendEmailDto): Promise<SendEmailResponse> {
    const response = await this.post<SendEmailResponse>(
      "/api/integrations/gmail/send-email",
      data,
    );
    return response;
  }
}
