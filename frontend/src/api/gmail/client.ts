import { BaseApiClient } from "../base";
import { GmailAuthUrlResponse, SendEmailDto, SendEmailResponse } from "./types";

export class GmailApiClient extends BaseApiClient {
  async getAuthUrl(): Promise<GmailAuthUrlResponse> {
    const response = await this.get<GmailAuthUrlResponse>(
      "/api/integrations/google/auth-url",
    );
    return response;
  }

  async handleCallback(): Promise<void> {
    await this.get<void>("/api/integrations/google/callback");
  }

  async sendEmail(data: SendEmailDto): Promise<SendEmailResponse> {
    const response = await this.post<SendEmailResponse>(
      "/api/integrations/google/send-email",
      data,
    );
    return response;
  }
}
