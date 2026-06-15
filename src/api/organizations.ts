import { apiClient } from "./client";
import type {
  InviteCreate,
  Organization,
  OrganizationSummary,
  OrgInvite,
  OrgMember,
  OrgRole,
  Token,
} from "../types";

/**
 * Organization (multi-tenant) endpoints.
 *
 * Management calls take the org id in the path and authorize against the
 * caller's membership in THAT org — so a user can manage any org they belong
 * to without switching to it first. Switching re-issues an access token scoped
 * to the chosen org; the active org otherwise comes from the current token.
 */
export const organizationsApi = {
  /** Every org the current user belongs to, with their role in each. */
  async list(): Promise<OrganizationSummary[]> {
    const { data } = await apiClient.get<OrganizationSummary[]>("/organizations");
    return data;
  },

  /** The org the current token is scoped to. */
  async current(): Promise<OrganizationSummary> {
    const { data } = await apiClient.get<OrganizationSummary>(
      "/organizations/current"
    );
    return data;
  },

  /** Create a team org. The caller becomes its owner. Call `switch` to act in it. */
  async create(name: string): Promise<Organization> {
    const { data } = await apiClient.post<Organization>("/organizations", { name });
    return data;
  },

  async rename(orgId: number, name: string): Promise<Organization> {
    const { data } = await apiClient.patch<Organization>(
      `/organizations/${orgId}`,
      { name }
    );
    return data;
  },

  async remove(orgId: number): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}`);
  },

  /** Re-issue an access token scoped to another org the caller belongs to. */
  async switch(orgId: number): Promise<Token> {
    const { data } = await apiClient.post<Token>(`/organizations/${orgId}/switch`);
    return data;
  },

  // ----- Members --------------------------------------------------------
  async listMembers(orgId: number): Promise<OrgMember[]> {
    const { data } = await apiClient.get<OrgMember[]>(
      `/organizations/${orgId}/members`
    );
    return data;
  },

  async updateMemberRole(
    orgId: number,
    memberUserId: number,
    role: "admin" | "member"
  ): Promise<OrgMember> {
    const { data } = await apiClient.patch<OrgMember>(
      `/organizations/${orgId}/members/${memberUserId}`,
      { role }
    );
    return data;
  },

  async removeMember(orgId: number, memberUserId: number): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/members/${memberUserId}`);
  },

  // ----- Invites --------------------------------------------------------
  async createInvite(orgId: number, payload: InviteCreate): Promise<OrgInvite> {
    const { data } = await apiClient.post<OrgInvite>(
      `/organizations/${orgId}/invites`,
      payload
    );
    return data;
  },

  async listInvites(orgId: number): Promise<OrgInvite[]> {
    const { data } = await apiClient.get<OrgInvite[]>(
      `/organizations/${orgId}/invites`
    );
    return data;
  },

  async revokeInvite(orgId: number, inviteId: number): Promise<void> {
    await apiClient.post(`/organizations/${orgId}/invites/${inviteId}/revoke`);
  },

  /** Accept an invite by its token. The caller becomes a member of the org. */
  async acceptInvite(token: string): Promise<OrganizationSummary> {
    const { data } = await apiClient.post<OrganizationSummary>(
      "/organizations/accept-invite",
      { token }
    );
    return data;
  },
};

/** True if the role may manage members/invites (owner or admin). */
export const canManageOrg = (role: OrgRole | undefined): boolean =>
  role === "owner" || role === "admin";
