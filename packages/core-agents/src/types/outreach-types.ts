import { BaseEntity, Result } from '../../../types/src/index';

// Lead data interfaces
export interface LeadProfile extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  linkedInUrl?: string;
  industry?: string;
  location?: string;
  profilePicture?: string;
  companySize?: string;
  experience?: string;
}

export interface EnrichedLead extends LeadProfile {
  score: number;
  enrichmentData: {
    socialProfiles: SocialProfile[];
    companyInfo: CompanyInfo;
    contactInfo: ContactInfo;
    interests: string[];
    recentActivity: ActivityData[];
  };
}

export interface SocialProfile {
  platform: string;
  url: string;
  followers?: number;
  verified?: boolean;
}

export interface CompanyInfo {
  name: string;
  size: string;
  industry: string;
  description: string;
  website?: string;
  revenue?: string;
  headquarters?: string;
}

export interface ContactInfo {
  phone?: string;
  alternateEmails?: string[];
  timezone?: string;
}

export interface ActivityData {
  type: 'post' | 'article' | 'comment' | 'share';
  content: string;
  date: Date;
  engagement: number;
}

// Email campaign interfaces
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'initial' | 'followup1' | 'followup2' | 'final';
}

export interface EmailSequence {
  id: string;
  leadId: string;
  templates: EmailTemplate[];
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'replied';
  scheduledSendTimes: Date[];
}

export interface OutreachCampaign extends BaseEntity {
  name: string;
  description: string;
  templates: EmailTemplate[];
  leads: string[]; // Lead IDs
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  totalLeads: number;
  emailsSent: number;
  opensCount: number;
  repliesCount: number;
  positiveReplies: number;
  negativeReplies: number;
  neutrelReplies: number;
  conversionRate: number;
  openRate: number;
  replyRate: number;
}

// Scoring and analysis
export interface LeadScore {
  total: number;
  factors: {
    profileCompleteness: number;
    jobRelevance: number;
    companySize: number;
    recentActivity: number;
    contactability: number;
  };
  reasoning: string;
}

export interface ReplyAnalysis {
  type: 'positive' | 'negative' | 'neutral' | 'not_interested' | 'request_info';
  sentiment: number; // -1 to 1
  keywords: string[];
  suggestedResponse?: string;
  shouldContinueSequence: boolean;
}

// Configuration and settings
export interface OutreachConfig {
  linkedInScrapingEnabled: boolean;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
  dailyEmailLimit: number;
  followUpIntervals: number[]; // days between follow-ups
  autoReplyAnalysis: boolean;
  templates: EmailTemplate[];
}

// API interfaces
export interface ScrapingResult {
  leads: LeadProfile[];
  totalFound: number;
  errors: string[];
}

export interface EnrichmentResult extends Result<EnrichedLead> {
  sources: string[];
  confidence: number;
}

export interface EmailSendResult extends Result<void> {
  messageId?: string;
  scheduledFor?: Date;
}