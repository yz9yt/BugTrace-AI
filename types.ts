// @author: Albert C | @yz9yt | github.com/yz9yt
// types.ts
// version 0.1 Beta
export enum View {
  URL_ANALYSIS = 'URL_ANALYSIS',
  CODE_ANALYSIS = 'CODE_ANALYSIS',
  PAYLOAD_TOOLS = 'PAYLOAD_TOOLS',
  DISCOVERY_TOOLS = 'DISCOVERY_TOOLS',
  JWT_ANALYZER = 'JWT_ANALYZER',
  EXPLOIT_TOOLS = 'EXPLOIT_TOOLS',
  FILE_UPLOAD_AUDITOR = 'FILE_UPLOAD_AUDITOR',
  WEB_SEC_AGENT = 'WEB_SEC_AGENT',
  XSS_EXPLOIT_ASSISTANT = 'XSS_EXPLOIT_ASSISTANT', // This is a special view, not in the main navigator
  SQL_EXPLOIT_ASSISTANT = 'SQL_EXPLOIT_ASSISTANT', // Special view for SQLi
  HISTORY = 'HISTORY',
}

export enum Tool {
  SAST = 'SAST',
  DAST = 'DAST',
  SECURITY_HEADERS_ANALYZER = 'SECURITY_HEADERS_ANALYZER',
  JS_RECON = 'JS_RECON',
  DOM_XSS_PATHFINDER = 'DOM_XSS_PATHFINDER',
  PAYLOAD_FORGE = 'PAYLOAD_FORGE',
  SSTI_FORGE = 'SSTI_FORGE',
  PRIVESC_PATHFINDER = 'PRIVESC_PATHFINDER',
  OOB_INTERACTION_HELPER = 'OOB_INTERACTION_HELPER',
  URL_LIST_FINDER = 'URL_LIST_FINDER',
  SUBDOMAIN_FINDER = 'SUBDOMAIN_FINDER',
}

export enum Severity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFO = 'Info',
  UNKNOWN = 'Unknown'
}

export type DastScanType = 'recon' | 'active' | 'greybox';

export interface InjectionPoint {
  type: 'URL_PARAM' | 'POST_PARAM' | 'PATH';
  parameter: string; // e.g., 'q', 'name', 'id'
  method?: 'GET' | 'POST';
}

export interface Vulnerability {
  vulnerability: string;
  severity: Severity;
  description: string;
  impact: string;
  recommendation: string;
  vulnerableCode: string; // The vulnerable pattern or example payload
  injectionPoint?: InjectionPoint; // Where the injection occurs
}

export interface VulnerabilityReport {
  id?: string;
  analyzedTarget: string;
  vulnerabilities: Vulnerability[];
}

export interface XssPayload {
    payload: string;
    description: string;
    mechanism: string;
    encoding: string;
}

export interface XssPayloadResult {
    payloads: XssPayload[];
    explanation: string;
}

export interface SqlmapCommandResult {
  command: string;
  explanation: string;
}

export interface ForgedPayload {
    technique: string;
    description: string;
    payload: string;
}

export interface ForgedPayloadResult {
    payloads: ForgedPayload[];
}

export interface FormInput {
    name: string;
    type: string;
    value?: string;
    isVulnerable: boolean;
}

export interface ExploitPath {
    exploitUrl: string;
    formMethod: 'GET' | 'POST';
    formInputs: FormInput[];
    reproductionGuide: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  isLoading?: boolean;
}

export interface ExploitContext {
    vulnerability: Vulnerability;
    targetUrl?: string;
}

export interface HeaderFinding {
    name: string;
    value: string | null;
    status: 'Present - Good' | 'Present - Misconfigured' | 'Missing';
    recommendation: string;
    severity: 'High' | 'Medium' | 'Low' | 'Info';
}

export interface HeadersReport {
    analyzedUrl: string;
    overallScore: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    findings: HeaderFinding[];
}

// Types for DOM XSS Pathfinder
export interface DomXssConnectedPath {
    source: string;
    sink: string;
    code_snippet: string;
    explanation: string;
}

export interface DomXssUnconnectedFinding {
    type: 'source' | 'sink';
    value: string;
}

export interface DomXssAnalysisResult {
    connected_paths: DomXssConnectedPath[];
    unconnected_findings: DomXssUnconnectedFinding[];
}

export interface FileUploadAnalysisResult {
    found: boolean;
    description: string;
    manualTestingGuide: string;
}

export type ApiProvider = 'openrouter' | 'localai';

export interface ApiKeys {
    openrouter: string;
    localai: string; // Optional API key for local AI
}

export interface LocalAiConfig {
    baseUrl: string;
    model: string;
}

export type ApiOptions = {
    provider: ApiProvider;
    apiKey: string;
    model: string;
    baseUrl?: string; // For Local AI / LiteLLM
};

// New interface for vulnerability validation result
export interface ValidationResult {
    is_valid: boolean;
    reasoning: string;
}
