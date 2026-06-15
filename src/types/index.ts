// Types mirror backend Pydantic schemas

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
  // The organization this token is scoped to (the active tenant). Returned by
  // login / register / switch-org so the client can track the active workspace.
  organization_id?: number | null;
}

// Organizations (multi-tenant). Resources belong to an org; a user accesses
// them through a Membership carrying one of these roles.
export type OrgRole = "owner" | "admin" | "member";

/** An org plus the caller's role in it — used for the org switcher. */
export interface OrganizationSummary {
  id: number;
  name: string;
  is_personal: boolean;
  role: OrgRole;
}

export interface Organization {
  id: number;
  name: string;
  is_personal: boolean;
  created_at: string;
}

export interface OrganizationCreate {
  name: string;
}

export interface OrgMember {
  user_id: number;
  email: string;
  full_name?: string | null;
  role: OrgRole;
  created_at: string;
}

export interface OrgInvite {
  id: number;
  organization_id: number;
  email: string;
  role: OrgRole;
  status: "pending" | "accepted" | "revoked";
  token: string;
  created_at: string;
  expires_at?: string | null;
}

export interface InviteCreate {
  email: string;
  // Only "admin" | "member" are assignable; "owner" is set at creation.
  role?: "admin" | "member";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
}

// Projects
export interface Project {
  id: number;
  name: string;
  domain: string;
  description?: string | null;
  // Projects now belong to an organization (tenant). owner_id is the creator
  // and may be null if that user was removed from the org.
  organization_id: number;
  owner_id?: number | null;
  created_at: string;
}

export interface ProjectCreate {
  name: string;
  domain: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

// SEO Analysis
export interface MetaTagAnalysis {
  title?: string | null;
  title_length: number;
  meta_description?: string | null;
  description_length: number;
  canonical?: string | null;
  robots?: string | null;
  og_tags: Record<string, string>;
  twitter_tags: Record<string, string>;
  issues: string[];
}

export interface HeadingAnalysis {
  h1: string[];
  h2: string[];
  h3: string[];
  h1_count: number;
  issues: string[];
}

export interface ImageAnalysis {
  total: number;
  missing_alt: number;
  issues: string[];
}

export interface LinkAnalysis {
  internal: number;
  external: number;
  broken_count: number;
  nofollow: number;
}

export interface TechnicalSEO {
  has_robots_txt: boolean;
  has_sitemap: boolean;
  has_canonical: boolean;
  https: boolean;
  mobile_viewport: boolean;
  structured_data: boolean;
  page_size_kb: number;
  response_time_ms: number;
}

export interface KeywordSummary {
  term: string;
  frequency: number;
  density: number;
  relevance_score?: number;
}

export interface SEOAnalysisResult {
  url: string;
  overall_score: number;
  title_score: number;
  meta_score: number;
  heading_score: number;
  content_score: number;
  technical_score: number;
  meta: MetaTagAnalysis;
  headings: HeadingAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  technical: TechnicalSEO;
  word_count: number;
  keywords: KeywordSummary[];
  issues: string[];
  recommendations: string[];
  ai_summary?: string | null;
}

export interface AnalyzeRequest {
  url: string;
  project_id?: number;
  focus_keyword?: string;
  deep?: boolean;
}

export interface SEOReport {
  id: number;
  project_id: number;
  url: string;
  status: string;
  overall_score: number;
  title_score: number;
  meta_score: number;
  heading_score: number;
  content_score: number;
  technical_score: number;
  issues?: unknown;
  recommendations?: unknown;
  ai_summary?: string | null;
  created_at: string;
  completed_at?: string | null;
}

// Keywords
export interface KeywordBase {
  term: string;
  frequency: number;
  density: number;
  relevance_score: number;
  cluster_label?: string | null;
  source: string;
}

export interface KeywordRead extends KeywordBase {
  id: number;
  project_id: number;
  created_at: string;
}

export interface KeywordExtractRequest {
  text?: string;
  url?: string;
  top_n?: number;
  min_length?: number;
}

export interface KeywordExtractResponse {
  keywords: KeywordBase[];
  total: number;
  source_url?: string | null;
}

export interface KeywordCluster {
  label: string;
  members: string[];
  centroid_term?: string | null;
}

export interface KeywordClusterRequest {
  keywords: string[];
  n_clusters?: number;
}

export interface KeywordClusterResponse {
  clusters: KeywordCluster[];
}

// AI / RAG
export interface AIRecommendationRequest {
  url?: string;
  content?: string;
  focus_keyword?: string;
}

export interface AIRecommendationResponse {
  summary: string;
  recommendations: string[];
  score_estimate?: number | null;
}

export interface BacklinkAgentRequest {
  target_url: string;
  internal_pages?: string[];
  prospect_urls?: string[];
  focus_keyword?: string;
  max_internal_suggestions?: number;
  max_prospects?: number;
  crawl_internal?: boolean;
}

export interface InternalLinkSuggestion {
  source_url: string;
  target_url: string;
  anchor_text: string;
  context: string;
  reason: string;
  confidence: number;
}

export interface BacklinkProspect {
  url: string;
  domain: string;
  status: number;
  relevance_score: number;
  already_links: boolean;
  has_resource_section: boolean;
  shared_topics: string[];
  rationale: string;
  outreach_email?: string | null;
}

export interface BacklinkAgentResponse {
  target: string;
  target_domain: string;
  summary: string;
  internal_link_suggestions: InternalLinkSuggestion[];
  prospects: BacklinkProspect[];
  ai_enabled: boolean;
}

// Backlink automation: human-in-the-loop (draft, queue, export only)
export interface InternalPatch {
  source_url: string;
  target_url: string;
  anchor_text: string;
  original_snippet: string;
  patched_snippet: string;
  diff: string;
  confidence: number;
}

export interface InternalExportRequest {
  target_url: string;
  internal_pages?: string[];
  focus_keyword?: string;
  max_suggestions?: number;
  crawl_internal?: boolean;
}

export interface InternalExportResponse {
  target: string;
  guardrails: string;
  patches: InternalPatch[];
  csv: string;
}

export interface ProspectDiscoveryRequest {
  target_url: string;
  seed_urls?: string[];
  focus_keyword?: string;
  max_prospects?: number;
  persist?: boolean;
}

export interface BrokenLinkOpportunity {
  resource_url: string;
  broken_url: string;
  anchor_text: string;
  http_status: number;
  relevance_score: number;
  suggested_replacement: string;
  outreach_email?: string | null;
}

export interface BrokenLinkScanRequest {
  target_url: string;
  resource_urls?: string[];
  focus_keyword?: string;
  max_opportunities?: number;
  persist?: boolean;
}

export interface BrokenLinkScanResponse {
  target: string;
  guardrails: string;
  summary: string;
  opportunities: BrokenLinkOpportunity[];
  ai_enabled: boolean;
}

export interface GuestPostRequest {
  target_url: string;
  focus_keyword?: string;
  host_blog_url?: string;
  tone?: string;
  persist?: boolean;
}

export interface GuestPostResponse {
  target: string;
  guardrails: string;
  title: string;
  markdown: string;
  html: string;
  word_count: number;
  ai_generated: boolean;
  draft_id?: number | null;
}

export interface BusinessProfile {
  name: string;
  website: string;
  description: string;
  category?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
}

export interface DirectoryQueueItem {
  directory_name: string;
  submit_url: string;
  requires_account: boolean;
  notes: string;
  payload: Record<string, string>;
  missing_fields: string[];
}

export interface DirectoryQueueRequest {
  profile: BusinessProfile;
  persist?: boolean;
}

export interface DirectoryQueueResponse {
  guardrails: string;
  items: DirectoryQueueItem[];
}

export interface QueueListResponse {
  kind: string;
  items: Record<string, unknown>[];
}

export interface QueueStatusUpdate {
  status: string;
}

export interface RAGQuery {
  question: string;
  top_k?: number;
  project_id?: number;
}

export interface RAGResponse {
  answer: string;
  sources: Record<string, unknown>[];
}

// Crawler
export interface CrawlRequest {
  url: string;
  max_pages?: number;
  same_domain_only?: boolean;
}

export interface CrawledPage {
  url: string;
  status_code: number;
  title?: string | null;
  word_count: number;
  fetched_at: string;
}

export interface CrawlResponse {
  seed: string;
  total_pages: number;
  pages: CrawledPage[];
}

// Competitor
export interface CompetitorRequest {
  target_url: string;
  competitor_urls: string[];
  focus_keyword?: string;
}

export interface CompetitorReport {
  target: SEOAnalysisResult;
  competitors: SEOAnalysisResult[];
  gaps: string[];
  opportunities: string[];
}

// AI Visibility (GEO + AEO)
export interface GEOSignal {
  name: string;
  label: string;
  value: number;
  score: number;
  detail: string;
}

export interface SnippetOpportunity {
  heading: string;
  block_type: string;
  text_preview: string;
  word_count: number;
  snippet_score: number;
  rationale: string;
  suggestions: string[];
}

export interface AIVisibilityResult {
  url: string;
  geo_score: number;
  aeo_score: number;
  combined_score: number;
  geo_signals: GEOSignal[];
  claim_count: number;
  statistic_count: number;
  source_links: number;
  quotable_definitions: string[];
  snippet_opportunities: SnippetOpportunity[];
  question_headings: string[];
  paa_questions: string[];
  paa_with_answers: { question: string; answer: string }[];
  recommendations: string[];
  ai_enabled: boolean;
  notes: string[];
}

export interface AIVisibilityRequest {
  url: string;
  focus_keyword?: string;
  use_ai?: boolean;
  max_paa?: number;
}

// Tech audit: Core Web Vitals + Schema
export interface WebVitalsMetric {
  key: string;
  label: string;
  value: number;
  display: string;
  unit: string;
  rating: "good" | "needs-improvement" | "poor" | "unknown";
  good_max?: number | null;
  poor_min?: number | null;
}

export interface WebVitalsResult {
  url: string;
  source: "psi" | "heuristic";
  strategy: "mobile" | "desktop";
  performance_score: number;
  field_data: boolean;
  metrics: WebVitalsMetric[];
  opportunities: string[];
  notes: string[];
}

export interface SchemaBlock {
  types: string[];
  valid_json: boolean;
  errors: string[];
  warnings: string[];
}

export interface SchemaAuditResult {
  url: string;
  detected_types: string[];
  jsonld_blocks: number;
  microdata_detected: boolean;
  score: number;
  blocks: SchemaBlock[];
  errors: string[];
  warnings: string[];
  recommendations: string[];
  generated_for?: string | null;
  generated_jsonld?: string | null;
}

export interface TechAuditRequest {
  url: string;
  strategy?: "mobile" | "desktop";
}

export interface TechAuditResponse {
  url: string;
  combined_score: number;
  web_vitals: WebVitalsResult;
  schema_audit: SchemaAuditResult;
  summary: string;
}

// Background tasks
export type TaskState =
  | "PENDING"
  | "STARTED"
  | "PROGRESS"
  | "SUCCESS"
  | "FAILURE"
  | "RETRY"
  | "REVOKED";

export interface TaskSubmitResponse {
  task_id: string;
  status: TaskState;
}

export interface TaskStatusResponse<T = Record<string, unknown>> {
  task_id: string;
  status: TaskState;
  progress?: { stage?: string; [key: string]: unknown } | null;
  result?: T | null;
  error?: string | null;
}

export interface ApiError {
  detail:
    | string
    | { msg: string; loc: (string | number)[] }[]
    | { code: string; message: string; detail?: string | null };
}

// ----- Outreach / Gmail ----------------------------------------------------

export interface SendAsIdentity {
  email: string;
  display_name?: string | null;
  is_default: boolean;
  verification_status?: string | null;
}

export interface EmailAccount {
  id: number;
  provider: string;
  email_address: string;
  display_name?: string | null;
  send_as: SendAsIdentity[];
  is_active: boolean;
  daily_send_cap: number;
  sends_today: number;
  last_used_at?: string | null;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAccountUpdate {
  daily_send_cap?: number;
  is_active?: boolean;
}

export interface GoogleAuthUrl {
  auth_url: string;
  state: string;
}

export interface GoogleOAuthCallbackPayload {
  code: string;
  state: string;
  redirect_uri: string;
}

// ----- Google Search Console -------------------------------------------------

export interface GSCConnection {
  id: number;
  account_email: string;
  display_name?: string | null;
  is_active: boolean;
  last_error?: string | null;
  last_synced_at?: string | null;
  created_at: string;
}

export interface GSCSite {
  site_url: string;
  permission_level?: string | null;
}

export interface GSCSitesResponse {
  connection_id: number;
  sites: GSCSite[];
}

export interface GSCPerformanceRequest {
  connection_id: number;
  site_url: string;
  days?: number;
  dimension?: string;
  row_limit?: number;
}

export interface GSCQueryRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCPerformanceResponse {
  site_url: string;
  dimension: string;
  start_date: string;
  end_date: string;
  rows: GSCQueryRow[];
  total_clicks: number;
  total_impressions: number;
}

export interface GSCImportRequest {
  project_id: number;
  connection_id: number;
  site_url: string;
  days?: number;
  min_impressions?: number;
  limit?: number;
}

export interface GSCImportResponse {
  project_id: number;
  imported: number;
  updated: number;
  skipped: number;
}

// ----- Google Analytics 4 ----------------------------------------------------

export interface GAConnection {
  id: number;
  account_email: string;
  display_name?: string | null;
  is_active: boolean;
  last_error?: string | null;
  last_synced_at?: string | null;
  created_at: string;
}

export interface GAProperty {
  property: string;
  display_name?: string | null;
  account_name?: string | null;
}

export interface GAPropertiesResponse {
  connection_id: number;
  properties: GAProperty[];
}

export interface GAReportRequest {
  connection_id: number;
  property: string;
  days?: number;
  dimension?: string;
  limit?: number;
}

export interface GAReportRow {
  dimension: string;
  sessions: number;
  total_users: number;
  new_users: number;
  screen_page_views: number;
  engagement_rate: number;
  avg_session_duration: number;
  bounce_rate: number;
  conversions: number;
}

export interface GAReportResponse {
  property: string;
  dimension: string;
  start_date: string;
  end_date: string;
  rows: GAReportRow[];
  total_sessions: number;
  total_users: number;
  total_new_users: number;
  total_screen_page_views: number;
  total_conversions: number;
  engagement_rate: number;
  avg_session_duration: number;
  bounce_rate: number;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body_text: string;
  body_html?: string | null;
  category: string;
  is_default: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateCreate {
  name: string;
  subject: string;
  body_text: string;
  body_html?: string;
  category?: string;
  is_default?: boolean;
}

export interface EmailTemplateUpdate {
  name?: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  category?: string;
  is_default?: boolean;
}

export interface FollowUpStep {
  step_order: number;
  delay_days: number;
  template_id: number;
}

export interface CampaignCreate {
  name: string;
  email_account_id: number;
  template_id: number;
  from_email?: string;
  track_opens?: boolean;
  daily_cap_override?: number;
  prospect_ids?: number[];
  follow_ups?: FollowUpStep[];
}

export interface CampaignUpdate {
  name?: string;
  status?: "draft" | "sending" | "paused" | "completed";
  track_opens?: boolean;
  daily_cap_override?: number;
}

export interface Campaign {
  id: number;
  name: string;
  email_account_id: number;
  template_id?: number | null;
  from_email?: string | null;
  status: "draft" | "sending" | "paused" | "completed";
  track_opens: boolean;
  sent_count: number;
  opened_count: number;
  replied_count: number;
  failed_count: number;
  daily_cap_override?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignSendResult {
  prospect_id: number;
  status: string;
  error?: string | null;
  log_id?: number | null;
}

export interface CampaignSendResponse {
  campaign_id: number;
  results: CampaignSendResult[];
  sent: number;
  failed: number;
  skipped: number;
  quota_remaining: number;
}

export interface OutreachAccountStats {
  email_account_id: number;
  email_address: string;
  sent_today: number;
  daily_cap: number;
  last_used_at?: string | null;
}

export interface RecentSendEntry {
  id: number;
  recipient: string;
  subject: string;
  status: string;
  error_code?: string | null;
  created_at: string;
  opened_at?: string | null;
  replied_at?: string | null;
}

export interface OutreachDashboard {
  sent_total: number;
  sent_today: number;
  opened_total: number;
  replied_total: number;
  failed_total: number;
  pending_follow_ups: number;
  accounts: OutreachAccountStats[];
  recent_sends: RecentSendEntry[];
}

export interface OutreachSendRequest {
  email_account_id: number;
  recipient: string;
  from_email?: string;
  subject?: string;
  body_html?: string;
  track_opens?: boolean;
}

export interface OutreachSendResponse {
  status: string;
  message_id?: string | null;
  log_id: number;
}

export interface BulkOutreachSendRequest {
  email_account_id: number;
  prospect_ids: number[];
  from_email?: string;
  template_id?: number;
  track_opens?: boolean;
}

// ---------------------------------------------------------------------------
// Rank tracking
// ---------------------------------------------------------------------------

export interface RankTarget {
  id: number;
  project_id: number;
  gsc_connection_id: number;
  site_url: string;
  is_active: boolean;
  last_captured_on?: string | null;
  created_at: string;
}

export interface RankTargetCreate {
  project_id: number;
  connection_id: number;
  site_url: string;
}

export interface CaptureResponse {
  captured: number;
  captured_on?: string | null;
}

export interface RankHistoryPoint {
  date: string;
  position: number;
}

export type RankStatus = "new" | "improved" | "stable" | "declined";

export interface RankSummaryItem {
  query: string;
  current_position: number;
  previous_position?: number | null;
  change?: number | null; // + = improved (gained positions)
  clicks: number;
  impressions: number;
  ctr: number;
  captured_on: string;
  status: RankStatus;
  alert: boolean;
  reasons: string[];
  history: RankHistoryPoint[];
}

export interface RankSummaryResponse {
  project_id: number;
  items: RankSummaryItem[];
  trend: RankHistoryPoint[];
}

// ---------------------------------------------------------------------------
// White-label reports
// ---------------------------------------------------------------------------

export interface ReportBranding {
  company_name?: string;
  accent_color?: string;
  logo_url?: string;
  footer_note?: string;
}

export interface ReportGenerateRequest {
  project_id: number;
  title?: string;
  branding?: ReportBranding;
}

export interface GeneratedReportListItem {
  id: number;
  project_id: number;
  title: string;
  created_at: string;
}

export interface GeneratedReportList {
  project_id: number;
  items: GeneratedReportListItem[];
}

export interface ReportRankItem {
  query: string;
  current_position: number;
  change?: number | null;
  impressions: number;
  status: RankStatus;
  reasons: string[];
}

export interface GeneratedReport {
  id: number;
  project_id: number;
  title: string;
  branding?: ReportBranding | null;
  created_at: string;
  // Stored payload (see report_builder.build):
  payload: {
    project: { id: number; name: string; domain: string };
    generated_at: string;
    branding: ReportBranding;
    audit: {
      url: string;
      overall_score: number;
      title_score: number;
      meta_score: number;
      heading_score: number;
      content_score: number;
      technical_score: number;
      issues: string[];
      recommendations: string[];
      ai_summary?: string | null;
    } | null;
    keywords: {
      term: string;
      frequency: number;
      density: number;
      relevance_score: number;
      source: string;
    }[];
    rank: {
      tracked: ReportRankItem[];
      declines: { query: string; reasons: string[] }[];
      trend: RankHistoryPoint[];
    };
    summary_counts: {
      keywords: number;
      tracked_queries: number;
      declines: number;
    };
  };
}
