
export type Role = 'Admin' | 'Coach' | 'Agent';
export type HubType = 'SHL' | 'Language' | 'Sales' | 'Culture' | 'WorkNature' | 'Coach' | 'Agent' | 'CourseManager' | 'AccessManagement' | 'Simulation';
export type TabType = 'Overview' | 'Library' | 'Assign' | 'Progress' | 'Upload' | 'Export' | 'Users' | 'Bulk';
export type AccessStatus = 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
export type AccessSource = 'MANUAL' | 'SHL_AUTO' | 'BOOTSTRAP';

export interface User {
  email: string;
  role: Role;
  name: string;
  avatar?: string;
  id?: string; // Unified ID for linking
}

export interface AccessProfile {
  email: string;
  role: Role;
  status: AccessStatus;
  source: AccessSource;
  name: string;
  grantedAt: string;
  grantedByEmail: string;
  lastUpdatedAt: string;
  scope?: {
    waves?: string[];
    accounts?: string[];
    teams?: string[];
  };
}

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  hubType: HubType;
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface AgentHistoryEntry {
  date: string;
  overallScore: number;
  speaking: number;
  grammar: number;
}

export interface ClassGroup {
  id: string;
  name: string;
  coachId: string;
  agentIds: string[];
}

export interface Agent {
  testId: string;
  name: string;
  email: string;
  coachId?: string;
  classId?: string;
  writing: number;
  speaking: number;
  listening: number;
  grammar: number;
  analytical: number;
  overallAvg: number;
  cefr: string;
  primaryOpportunity: string;
  recommendedPlan: string;
  assignedModules: string;
  history?: AgentHistoryEntry[];
}

export interface DashboardMetrics {
  totalAgents: number;
  avgWriting: number;
  avgSpeaking: number;
  avgListening: number;
  avgGrammar: number;
  avgAnalytical: number;
  avgOverall: number;
}

export interface SHLData {
  id: string;
  agentEmail: string;
  listening: number;
  speaking: number;
  reading: number;
  sales: number;
  cefr: string; 
  opportunities: string[];
  confidenceScore: number;
  parsedAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'UNLOCK' | 'RELOCK' | 'SNAPSHOT' | 'UPLOAD' | 'ASSIGN' | 'ACCESS_CHANGE' | 'LOGIN' | 'LOGIN_DENIED';
  scope: string;
  user: string;
  details: string;
}

export interface AppState {
  unlockedScope: HubType | 'All' | null;
  auditLogs: AuditEntry[];
}

export interface Country {
  name: string;
  flag: string;
  region: string;
  personas: Persona[];
  dosAndDonts: string[];
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  character: string;
  fluency: string;
}

export interface WorkNature {
  id: string;
  name: string;
  icon: string;
}

export interface SimulationResult {
  id?: string;
  agentEmail?: string;
  timestamp?: string;
  type?: 'Voice' | 'Chat' | 'Email';
  scenario?: string;
  empathy: number;
  accuracy: number;
  compliance: number;
  status: 'PASS' | 'CONDITIONAL' | 'FAIL';
  feedback: string;
}
