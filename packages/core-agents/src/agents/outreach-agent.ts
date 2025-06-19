import { Logger, Result } from '../../../types/src/index';
import {
  LeadProfile,
  EnrichedLead,
  EmailSequence,
  EmailTemplate,
  OutreachCampaign,
  LeadScore,
  ReplyAnalysis,
  OutreachConfig,
  ScrapingResult,
  EnrichmentResult,
  EmailSendResult,
  CampaignMetrics
} from '../types/outreach-types';
import { LinkedInScraper } from '../services/linkedin-scraper';
import { LeadEnrichmentService } from '../services/lead-enrichment';
import { EmailService } from '../services/email-service';
import { ReplyAnalyzer } from '../services/reply-analyzer';

export class OutreachAgent {
  private logger: Logger;
  private config: OutreachConfig;
  private scraper: LinkedInScraper;
  private enrichmentService: LeadEnrichmentService;
  private emailService: EmailService;
  private replyAnalyzer: ReplyAnalyzer;

  constructor(
    config: OutreachConfig,
    logger: Logger
  ) {
    this.config = config;
    this.logger = logger;
    this.scraper = new LinkedInScraper(config, logger);
    this.enrichmentService = new LeadEnrichmentService(logger);
    this.emailService = new EmailService(config, logger);
    this.replyAnalyzer = new ReplyAnalyzer(logger);
  }

  /**
   * Main method to generate outreach sequence for a lead
   */
  async generateOutreachSequence(lead: LeadProfile): Promise<Result<EmailSequence>> {
    try {
      this.logger.info('Generating outreach sequence', { leadId: lead.id });

      // First, enrich the lead data
      const enrichedResult = await this.enrichLead(lead);
      if (!enrichedResult.success) {
        return { success: false, error: enrichedResult.error };
      }

      const enrichedLead = enrichedResult.data;

      // Score the lead to determine sequence priority
      const score = this.scoreLead(enrichedLead);

      // Select appropriate templates based on lead score and profile
      const templates = this.selectTemplatesForLead(enrichedLead, score);

      // Create the email sequence
      const sequence: EmailSequence = {
        id: `seq_${Date.now()}_${lead.id}`,
        leadId: lead.id,
        templates,
        currentStep: 0,
        status: 'active',
        scheduledSendTimes: this.calculateSendTimes(templates.length)
      };

      this.logger.info('Outreach sequence generated', { 
        sequenceId: sequence.id,
        templateCount: templates.length,
        leadScore: score.total 
      });

      return { success: true, data: sequence };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to generate outreach sequence', { 
        leadId: lead.id, 
        error: errorMessage 
      });
      return { 
        success: false, 
        error: { code: 'SEQUENCE_GENERATION_FAILED', message: errorMessage } 
      };
    }
  }

  /**
   * Score a lead based on various factors
   */
  scoreLead(leadData: EnrichedLead): LeadScore {
    const factors = {
      profileCompleteness: this.calculateProfileCompleteness(leadData),
      jobRelevance: this.calculateJobRelevance(leadData),
      companySize: this.calculateCompanySizeScore(leadData),
      recentActivity: this.calculateActivityScore(leadData),
      contactability: this.calculateContactabilityScore(leadData)
    };

    const total = Object.values(factors).reduce((sum, score) => sum + score, 0) / Object.keys(factors).length;

    const reasoning = this.generateScoreReasoning(factors, leadData);

    return {
      total: Math.round(total * 100) / 100,
      factors,
      reasoning
    };
  }

  /**
   * Scrape LinkedIn for leads based on search criteria
   */
  async scrapePotentialLeads(searchCriteria: {
    keywords: string[];
    location?: string;
    industry?: string;
    companySize?: string;
    seniority?: string;
    limit?: number;
  }): Promise<Result<ScrapingResult>> {
    try {
      this.logger.info('Starting LinkedIn scraping', { criteria: searchCriteria });

      if (!this.config.linkedInScrapingEnabled) {
        return {
          success: false,
          error: { code: 'SCRAPING_DISABLED', message: 'LinkedIn scraping is disabled in configuration' }
        };
      }

      const result = await this.scraper.searchProfiles(searchCriteria);
      
      this.logger.info('LinkedIn scraping completed', { 
        totalFound: result.totalFound,
        leadsExtracted: result.leads.length 
      });

      return { success: true, data: result };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('LinkedIn scraping failed', { error: errorMessage });
      return {
        success: false,
        error: { code: 'SCRAPING_FAILED', message: errorMessage }
      };
    }
  }

  /**
   * Enrich lead data with additional information
   */
  async enrichLead(lead: LeadProfile): Promise<EnrichmentResult> {
    try {
      this.logger.info('Enriching lead data', { leadId: lead.id });

      const enrichedData = await this.enrichmentService.enrichProfile(lead);
      
      return {
        success: true,
        data: enrichedData.data,
        sources: enrichedData.sources,
        confidence: enrichedData.confidence
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Lead enrichment failed', { leadId: lead.id, error: errorMessage });
      return {
        success: false,
        error: { code: 'ENRICHMENT_FAILED', message: errorMessage }
      };
    }
  }

  /**
   * Send email from sequence
   */
  async sendSequenceEmail(sequenceId: string, stepIndex: number): Promise<EmailSendResult> {
    try {
      // This would typically fetch the sequence from database
      // For now, we'll simulate the process
      
      this.logger.info('Sending sequence email', { sequenceId, stepIndex });

      // In real implementation, fetch sequence and validate step
      const result = await this.emailService.sendTemplatedEmail(
        'example@example.com', // This would come from the sequence
        this.config.templates[stepIndex] || this.config.templates[0]
      );

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to send sequence email', { 
        sequenceId, 
        stepIndex, 
        error: errorMessage 
      });
      return {
        success: false,
        error: { code: 'EMAIL_SEND_FAILED', message: errorMessage }
      };
    }
  }

  /**
   * Analyze reply and determine next action
   */
  async analyzeReply(emailContent: string, sequenceId: string): Promise<Result<ReplyAnalysis>> {
    try {
      this.logger.info('Analyzing email reply', { sequenceId });

      const analysis = await this.replyAnalyzer.analyzeReply(emailContent);

      // Update sequence status based on analysis
      if (analysis.type === 'positive') {
        // Mark sequence as successful, potentially create follow-up task
        this.logger.info('Positive reply detected', { sequenceId, type: analysis.type });
      } else if (analysis.type === 'negative' || analysis.type === 'not_interested') {
        // Pause or stop sequence
        this.logger.info('Negative reply detected, stopping sequence', { sequenceId, type: analysis.type });
      }

      return { success: true, data: analysis };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Reply analysis failed', { sequenceId, error: errorMessage });
      return {
        success: false,
        error: { code: 'REPLY_ANALYSIS_FAILED', message: errorMessage }
      };
    }
  }

  /**
   * Create and manage outreach campaigns
   */
  async createCampaign(campaignData: Omit<OutreachCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<Result<OutreachCampaign>> {
    try {
      const campaign: OutreachCampaign = {
        ...campaignData,
        id: `campaign_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          totalLeads: campaignData.leads.length,
          emailsSent: 0,
          opensCount: 0,
          repliesCount: 0,
          positiveReplies: 0,
          negativeReplies: 0,
          neutrelReplies: 0,
          conversionRate: 0,
          openRate: 0,
          replyRate: 0
        }
      };

      this.logger.info('Campaign created', { campaignId: campaign.id, leadCount: campaign.leads.length });

      return { success: true, data: campaign };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Campaign creation failed', { error: errorMessage });
      return {
        success: false,
        error: { code: 'CAMPAIGN_CREATION_FAILED', message: errorMessage }
      };
    }
  }

  // Private helper methods

  private calculateProfileCompleteness(lead: EnrichedLead): number {
    let score = 0;
    const maxScore = 10;

    // Basic profile fields (40% of score)
    if (lead.email) score += 1;
    if (lead.firstName && lead.lastName) score += 1;
    if (lead.company) score += 1;
    if (lead.position) score += 1;

    // Additional fields (60% of score)
    if (lead.linkedInUrl) score += 1;
    if (lead.industry) score += 1;
    if (lead.location) score += 1;
    if (lead.enrichmentData.socialProfiles.length > 0) score += 1;
    if (lead.enrichmentData.companyInfo.description) score += 1;
    if (lead.enrichmentData.contactInfo.phone) score += 1;

    return (score / maxScore) * 100;
  }

  private calculateJobRelevance(lead: EnrichedLead): number {
    // This would typically use ML or keyword matching
    // For now, simple heuristic based on position and industry
    const relevantPositions = ['ceo', 'cto', 'vp', 'director', 'manager', 'head'];
    const relevantIndustries = ['technology', 'software', 'saas', 'fintech'];

    let score = 50; // Base score

    if (relevantPositions.some(pos => lead.position.toLowerCase().includes(pos))) {
      score += 30;
    }

    if (relevantIndustries.some(industry => 
      lead.industry?.toLowerCase().includes(industry) || 
      lead.enrichmentData.companyInfo.industry.toLowerCase().includes(industry)
    )) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private calculateCompanySizeScore(lead: EnrichedLead): number {
    const companySize = lead.companySize || lead.enrichmentData.companyInfo.size;
    
    // Score based on company size (larger companies might be better targets)
    const sizeScore: Record<string, number> = {
      'startup': 60,
      '1-10': 50,
      '11-50': 70,
      '51-200': 85,
      '201-500': 90,
      '501-1000': 95,
      '1000+': 100
    };

    return sizeScore[companySize] || 50;
  }

  private calculateActivityScore(lead: EnrichedLead): number {
    const recentActivity = lead.enrichmentData.recentActivity;
    
    if (recentActivity.length === 0) return 30;

    // Score based on recent activity (more recent = higher score)
    const now = new Date();
    const recentActivities = recentActivity.filter(activity => {
      const daysDiff = (now.getTime() - activity.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30; // Within last 30 days
    });

    const baseScore = Math.min(recentActivities.length * 20, 80);
    const engagementBonus = recentActivities.reduce((sum, activity) => sum + Math.min(activity.engagement / 10, 2), 0);

    return Math.min(baseScore + engagementBonus, 100);
  }

  private calculateContactabilityScore(lead: EnrichedLead): number {
    let score = 40; // Base score for having an email

    if (lead.enrichmentData.contactInfo.phone) score += 20;
    if (lead.enrichmentData.contactInfo.alternateEmails?.length && lead.enrichmentData.contactInfo.alternateEmails.length > 0) score += 15;
    if (lead.linkedInUrl) score += 15;
    if (lead.enrichmentData.socialProfiles.length > 1) score += 10;

    return Math.min(score, 100);
  }

  private generateScoreReasoning(factors: Record<string, number>, lead: EnrichedLead): string {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.entries(factors).forEach(([factor, score]) => {
      if (score >= 80) {
        strengths.push(factor);
      } else if (score < 50) {
        weaknesses.push(factor);
      }
    });

    let reasoning = `Lead scoring for ${lead.firstName} ${lead.lastName} (${lead.company}): `;
    
    if (strengths.length > 0) {
      reasoning += `Strong in ${strengths.join(', ')}. `;
    }
    
    if (weaknesses.length > 0) {
      reasoning += `Needs improvement in ${weaknesses.join(', ')}. `;
    }

    reasoning += `Overall score: ${factors.total || 0}/100`;

    return reasoning;
  }

  private selectTemplatesForLead(lead: EnrichedLead, score: LeadScore): EmailTemplate[] {
    // Select templates based on lead score and characteristics
    const templates = [...this.config.templates];

    if (score.total >= 80) {
      // High-value lead - use premium template sequence
      return templates.filter(t => t.type === 'initial' || t.type === 'followup1');
    } else if (score.total >= 60) {
      // Medium-value lead - standard sequence
      return templates.filter(t => ['initial', 'followup1', 'followup2'].includes(t.type));
    } else {
      // Lower-value lead - shorter sequence
      return templates.filter(t => t.type === 'initial');
    }
  }

  private calculateSendTimes(templateCount: number): Date[] {
    const sendTimes = [];
    const now = new Date();
    
    // First email immediately
    sendTimes.push(new Date(now));

    // Subsequent emails based on follow-up intervals
    for (let i = 1; i < templateCount; i++) {
      const intervalDays = this.config.followUpIntervals[i - 1] || 3;
      const sendTime = new Date(now);
      sendTime.setDate(sendTime.getDate() + intervalDays * i);
      sendTimes.push(sendTime);
    }

    return sendTimes;
  }
}