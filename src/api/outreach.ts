import { apiClient } from "./client";
import type {
  BulkOutreachSendRequest,
  Campaign,
  CampaignCreate,
  CampaignSendResponse,
  CampaignUpdate,
  EmailAccount,
  EmailAccountUpdate,
  EmailTemplate,
  EmailTemplateCreate,
  EmailTemplateUpdate,
  GoogleAuthUrl,
  GoogleOAuthCallbackPayload,
  OutreachDashboard,
  OutreachSendRequest,
  OutreachSendResponse,
} from "../types";

/**
 * Outreach API client.
 *
 * All endpoints live under `/ai/email/*`. Errors come back as either a string
 * `detail` or a `{ code, message, detail }` object — `apiErrorMessage` in
 * `client.ts` already understands both shapes.
 */
export const outreachApi = {
  // ----- OAuth + accounts ------------------------------------------------
  async getGoogleAuthUrl(redirectUri: string): Promise<GoogleAuthUrl> {
    const { data } = await apiClient.get<GoogleAuthUrl>(
      "/ai/email/google/auth-url",
      { params: { redirect_uri: redirectUri } }
    );
    return data;
  },
  async completeGoogleAuth(payload: GoogleOAuthCallbackPayload): Promise<EmailAccount> {
    const { data } = await apiClient.post<EmailAccount>(
      "/ai/email/google/callback",
      payload
    );
    return data;
  },
  async listAccounts(): Promise<EmailAccount[]> {
    const { data } = await apiClient.get<EmailAccount[]>("/ai/email/accounts");
    return data;
  },
  async updateAccount(id: number, payload: EmailAccountUpdate): Promise<EmailAccount> {
    const { data } = await apiClient.patch<EmailAccount>(
      `/ai/email/accounts/${id}`,
      payload
    );
    return data;
  },
  async refreshSenders(id: number): Promise<EmailAccount> {
    const { data } = await apiClient.post<EmailAccount>(
      `/ai/email/accounts/${id}/refresh-senders`
    );
    return data;
  },
  async disconnectAccount(id: number): Promise<void> {
    await apiClient.delete(`/ai/email/accounts/${id}`);
  },

  // ----- Templates -------------------------------------------------------
  async listTemplates(category?: string): Promise<EmailTemplate[]> {
    const { data } = await apiClient.get<EmailTemplate[]>("/ai/email/templates", {
      params: category ? { category } : undefined,
    });
    return data;
  },
  async createTemplate(payload: EmailTemplateCreate): Promise<EmailTemplate> {
    const { data } = await apiClient.post<EmailTemplate>("/ai/email/templates", payload);
    return data;
  },
  async updateTemplate(id: number, payload: EmailTemplateUpdate): Promise<EmailTemplate> {
    const { data } = await apiClient.patch<EmailTemplate>(
      `/ai/email/templates/${id}`,
      payload
    );
    return data;
  },
  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/ai/email/templates/${id}`);
  },

  // ----- Campaigns -------------------------------------------------------
  async listCampaigns(): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>("/ai/email/campaigns");
    return data;
  },
  async createCampaign(payload: CampaignCreate): Promise<Campaign> {
    const { data } = await apiClient.post<Campaign>("/ai/email/campaigns", payload);
    return data;
  },
  async updateCampaign(id: number, payload: CampaignUpdate): Promise<Campaign> {
    const { data } = await apiClient.patch<Campaign>(
      `/ai/email/campaigns/${id}`,
      payload
    );
    return data;
  },
  async addProspectsToCampaign(id: number, prospectIds: number[]): Promise<{ campaign_id: number; added: number }> {
    const { data } = await apiClient.post(`/ai/email/campaigns/${id}/prospects`, {
      prospect_ids: prospectIds,
    });
    return data;
  },
  async sendCampaign(id: number, maxToSend = 100): Promise<CampaignSendResponse> {
    const { data } = await apiClient.post<CampaignSendResponse>(
      `/ai/email/campaigns/${id}/send`,
      { max_to_send: maxToSend }
    );
    return data;
  },

  // ----- Outreach send (single + bulk) -----------------------------------
  async sendOutreach(prospectId: number, payload: OutreachSendRequest): Promise<OutreachSendResponse> {
    const { data } = await apiClient.post<OutreachSendResponse>(
      `/ai/email/outreach/${prospectId}/send`,
      payload
    );
    return data;
  },
  async bulkSendOutreach(payload: BulkOutreachSendRequest): Promise<CampaignSendResponse> {
    const { data } = await apiClient.post<CampaignSendResponse>(
      "/ai/email/outreach/bulk-send",
      payload
    );
    return data;
  },

  // ----- Dashboard -------------------------------------------------------
  async dashboard(): Promise<OutreachDashboard> {
    const { data } = await apiClient.get<OutreachDashboard>("/ai/email/dashboard");
    return data;
  },
};
