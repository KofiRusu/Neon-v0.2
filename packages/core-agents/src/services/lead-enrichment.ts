import { Logger } from '@neon/types';
import { LeadProfile, EnrichedLead, SocialProfile, CompanyInfo, ContactInfo, ActivityData } from '../types/outreach-types';

export class LeadEnrichmentService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async enrichProfile(lead: LeadProfile): Promise<{
    data: EnrichedLead;
    sources: string[];
    confidence: number;
  }> {
    this.logger.info('Enriching lead profile', { leadId: lead.id });

    // Mock enrichment - in real scenario, this would call various APIs
    // like Clearbit, Hunter.io, Apollo, etc.
    
    const socialProfiles = await this.findSocialProfiles(lead);
    const companyInfo = await this.enrichCompanyInfo(lead.company);
    const contactInfo = await this.findContactInfo(lead);
    const interests = await this.extractInterests(lead);
    const recentActivity = await this.getRecentActivity(lead);

    const enrichedLead: EnrichedLead = {
      ...lead,
      score: 0, // Will be calculated later
      enrichmentData: {
        socialProfiles,
        companyInfo,
        contactInfo,
        interests,
        recentActivity
      }
    };

    const sources = [
      'LinkedIn',
      'Company Website',
      'Social Media',
      'Public Records'
    ];

    const confidence = this.calculateConfidence(enrichedLead);

    this.logger.info('Lead profile enrichment completed', {
      leadId: lead.id,
      confidence,
      sourcesUsed: sources.length
    });

    return {
      data: enrichedLead,
      sources,
      confidence
    };
  }

  private async findSocialProfiles(lead: LeadProfile): Promise<SocialProfile[]> {
    // Mock social profiles discovery
    const profiles: SocialProfile[] = [];

    if (lead.linkedInUrl) {
      profiles.push({
        platform: 'LinkedIn',
        url: lead.linkedInUrl,
        followers: Math.floor(Math.random() * 5000) + 500,
        verified: Math.random() > 0.7
      });
    }

    // Mock additional social profiles
    if (Math.random() > 0.6) {
      profiles.push({
        platform: 'Twitter',
        url: `https://twitter.com/${lead.firstName.toLowerCase()}${lead.lastName.toLowerCase()}`,
        followers: Math.floor(Math.random() * 2000) + 100,
        verified: Math.random() > 0.9
      });
    }

    if (Math.random() > 0.8) {
      profiles.push({
        platform: 'GitHub',
        url: `https://github.com/${lead.firstName.toLowerCase()}-${lead.lastName.toLowerCase()}`,
        followers: Math.floor(Math.random() * 1000) + 50
      });
    }

    return profiles;
  }

  private async enrichCompanyInfo(companyName: string): Promise<CompanyInfo> {
    // Mock company enrichment
    const industries = ['Technology', 'Software', 'SaaS', 'Fintech', 'Healthcare', 'E-commerce'];
    const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
    const revenues = ['$1M-$10M', '$10M-$50M', '$50M-$100M', '$100M-$500M', '$500M+'];
    
    return {
      name: companyName,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      description: `${companyName} is a leading company in the ${industries[Math.floor(Math.random() * industries.length)].toLowerCase()} sector, providing innovative solutions to businesses worldwide.`,
      website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      revenue: revenues[Math.floor(Math.random() * revenues.length)],
      headquarters: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA'][Math.floor(Math.random() * 5)]
    };
  }

  private async findContactInfo(lead: LeadProfile): Promise<ContactInfo> {
    // Mock contact info discovery
    const contactInfo: ContactInfo = {};

    // Sometimes add phone number
    if (Math.random() > 0.7) {
      contactInfo.phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    }

    // Sometimes add alternate emails
    if (Math.random() > 0.8) {
      contactInfo.alternateEmails = [
        `${lead.firstName.toLowerCase()}.${lead.lastName.toLowerCase()}@gmail.com`,
        `${lead.firstName.toLowerCase()}@${lead.company.toLowerCase().replace(/\s+/g, '')}.com`
      ];
    }

    // Add timezone based on location
    if (lead.location) {
      const timezoneMap: { [key: string]: string } = {
        'san francisco': 'America/Los_Angeles',
        'new york': 'America/New_York',
        'austin': 'America/Chicago',
        'seattle': 'America/Los_Angeles',
        'boston': 'America/New_York'
      };
      
      const city = Object.keys(timezoneMap).find(city => 
        lead.location!.toLowerCase().includes(city)
      );
      
      if (city) {
        contactInfo.timezone = timezoneMap[city];
      }
    }

    return contactInfo;
  }

  private async extractInterests(lead: LeadProfile): Promise<string[]> {
    // Mock interests extraction based on position and industry
    const techInterests = ['AI/ML', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Data Science'];
    const businessInterests = ['Leadership', 'Strategy', 'Innovation', 'Digital Transformation'];
    const industryInterests: { [key: string]: string[] } = {
      'technology': techInterests,
      'saas': [...techInterests, 'Product Management', 'Customer Success'],
      'fintech': [...techInterests, 'Blockchain', 'Payments', 'Compliance'],
      'healthcare': ['Digital Health', 'Telemedicine', 'Healthcare IT', 'Compliance']
    };

    let interests = [...businessInterests];
    
    if (lead.industry) {
      const industryKey = lead.industry.toLowerCase();
      if (industryInterests[industryKey]) {
        interests = [...interests, ...industryInterests[industryKey]];
      }
    }

    // Return random subset
    return interests.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
  }

  private async getRecentActivity(lead: LeadProfile): Promise<ActivityData[]> {
    // Mock recent activity
    const activities: ActivityData[] = [];
    const activityTypes: ActivityData['type'][] = ['post', 'article', 'comment', 'share'];
    const contents = [
      'Excited to share our latest product update!',
      'Thoughts on the future of AI in our industry',
      'Great insights from the recent conference',
      'Looking forward to connecting with more professionals',
      'Celebrating our team\'s achievements this quarter'
    ];

    const numActivities = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numActivities; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Within last 30 days
      
      activities.push({
        type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        date,
        engagement: Math.floor(Math.random() * 100) + 10
      });
    }

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private calculateConfidence(enrichedLead: EnrichedLead): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on available data
    if (enrichedLead.enrichmentData.socialProfiles.length > 0) confidence += 0.1;
    if (enrichedLead.enrichmentData.companyInfo.website) confidence += 0.1;
    if (enrichedLead.enrichmentData.contactInfo.phone) confidence += 0.1;
    if (enrichedLead.enrichmentData.recentActivity.length > 0) confidence += 0.1;
    if (enrichedLead.enrichmentData.interests.length > 3) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}