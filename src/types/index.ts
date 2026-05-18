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
  owner_id: number;
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
  detail: string | { msg: string; loc: (string | number)[] }[];
}
