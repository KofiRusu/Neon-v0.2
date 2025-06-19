# Core Agents Package

This package contains the core agents for the Neon platform, including the OutreachAgent for lead generation and email automation.

## Features

### OutreachAgent

The OutreachAgent is a comprehensive solution for automating lead generation and email outreach campaigns:

#### 🔍 Lead Generation
- **LinkedIn Scraping**: Mock LinkedIn directory scraping with configurable search criteria
- **Lead Enrichment**: Enhance profiles with social media, company info, and contact details
- **Lead Scoring**: Multi-factor scoring system to prioritize high-value prospects

#### 📧 Email Automation
- **Template-based Sequences**: Create personalized email sequences with variable substitution
- **Multi-provider Support**: SMTP, SendGrid, and Mailgun integration
- **Smart Scheduling**: Configurable follow-up intervals and daily limits

#### 🤖 Reply Intelligence
- **Sentiment Analysis**: Automatic classification of reply sentiment and intent
- **Response Suggestions**: AI-powered suggested responses based on reply type
- **Sequence Management**: Automatic pause/continue decisions based on reply analysis

#### 📊 Campaign Management
- **Campaign Creation**: Organize leads and templates into manageable campaigns
- **Metrics Tracking**: Monitor open rates, reply rates, and conversion metrics
- **Status Management**: Track campaign progress and lead engagement

## Installation

```bash
npm install @neon/core-agents
```

## Quick Start

```typescript
import { OutreachAgent } from '@neon/core-agents';

// Configure the agent
const config = {
  linkedInScrapingEnabled: true,
  emailProvider: 'sendgrid',
  dailyEmailLimit: 50,
  followUpIntervals: [3, 7, 14],
  autoReplyAnalysis: true,
  templates: [
    {
      id: 'initial',
      name: 'Initial Outreach',
      subject: 'Quick question about {{company}}',
      content: 'Hi {{firstName}}, I noticed your work at {{company}}...',
      variables: ['firstName', 'company'],
      type: 'initial'
    }
  ]
};

// Initialize the agent
const agent = new OutreachAgent(config, logger);

// Generate leads
const leads = await agent.scrapePotentialLeads({
  keywords: ['CTO', 'VP Engineering'],
  location: 'San Francisco',
  industry: 'Technology',
  limit: 10
});

// Create outreach sequence
const sequence = await agent.generateOutreachSequence(leads.data.leads[0]);
```

## API Reference

### OutreachAgent Methods

#### `generateOutreachSequence(lead: LeadProfile): Promise<Result<EmailSequence>>`
Creates a personalized email sequence for a lead based on their profile and score.

#### `scoreLead(leadData: EnrichedLead): LeadScore`
Scores a lead based on multiple factors:
- Profile completeness
- Job relevance
- Company size
- Recent activity
- Contactability

#### `scrapePotentialLeads(criteria: SearchCriteria): Promise<Result<ScrapingResult>>`
Scrapes LinkedIn (mock) for leads matching the specified criteria.

#### `enrichLead(lead: LeadProfile): Promise<EnrichmentResult>`
Enriches a lead profile with additional data from various sources.

#### `analyzeReply(emailContent: string, sequenceId: string): Promise<Result<ReplyAnalysis>>`
Analyzes email replies to determine sentiment, intent, and next actions.

#### `createCampaign(campaignData: CampaignData): Promise<Result<OutreachCampaign>>`
Creates and manages outreach campaigns with multiple leads and templates.

### Configuration Options

```typescript
interface OutreachConfig {
  linkedInScrapingEnabled: boolean;
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
  dailyEmailLimit: number;
  followUpIntervals: number[]; // Days between follow-ups
  autoReplyAnalysis: boolean;
  templates: EmailTemplate[];
}
```

## Email Templates

Templates support variable substitution using `{{variableName}}` syntax:

```typescript
const template = {
  id: 'followup_1',
  name: 'First Follow-up',
  subject: 'Re: {{originalSubject}}',
  content: `Hi {{firstName}},
  
  I wanted to follow up on my previous email about {{topic}}.
  
  Best regards,
  {{senderName}}`,
  variables: ['firstName', 'originalSubject', 'topic', 'senderName'],
  type: 'followup1'
};
```

## Lead Scoring

The scoring system evaluates leads across five key factors:

1. **Profile Completeness** (0-100): How much information is available
2. **Job Relevance** (0-100): How relevant their role is to your offering
3. **Company Size** (0-100): Company size scoring based on target preferences
4. **Recent Activity** (0-100): How active they are on social platforms
5. **Contactability** (0-100): How easy they are to reach

## Reply Analysis

The reply analyzer classifies responses into five categories:

- **Positive**: Interested, wants to schedule a call
- **Negative**: Explicitly negative, wants to be removed
- **Neutral**: Acknowledges but doesn't commit
- **Not Interested**: Politely declines
- **Request Info**: Asks for more information

## Examples

Run the example to see the OutreachAgent in action:

```bash
npm run example
```

This will demonstrate:
- Lead scraping from LinkedIn
- Lead enrichment and scoring
- Outreach sequence generation
- Reply analysis
- Campaign creation

## Development

```bash
# Build the package
npm run build

# Run in development mode
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

## Advanced Usage

### Custom Lead Scoring

You can customize the lead scoring by extending the OutreachAgent:

```typescript
class CustomOutreachAgent extends OutreachAgent {
  scoreLead(leadData: EnrichedLead): LeadScore {
    // Custom scoring logic
    const customScore = this.calculateCustomScore(leadData);
    return {
      total: customScore,
      factors: {
        // Custom factors
      },
      reasoning: 'Custom scoring applied'
    };
  }
}
```

### Integration with CRM

```typescript
// Example integration with a CRM system
const leads = await agent.scrapePotentialLeads(criteria);

for (const lead of leads.data.leads) {
  const enriched = await agent.enrichLead(lead);
  const score = agent.scoreLead(enriched.data);
  
  // Save to CRM
  await crm.createLead({
    ...lead,
    score: score.total,
    enrichmentData: enriched.data.enrichmentData
  });
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.