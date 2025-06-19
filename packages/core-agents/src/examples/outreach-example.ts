import { OutreachAgent } from '../agents/outreach-agent';
import { OutreachConfig, LeadProfile, EmailTemplate } from '../types/outreach-types';
import { Logger } from '../../../types/src/index';

// Example logger implementation
const logger: Logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
};

// Example email templates
const emailTemplates: EmailTemplate[] = [
  {
    id: 'initial_outreach',
    name: 'Initial Outreach',
    subject: 'Quick question about {{company}}',
    content: `Hi {{firstName}},

I noticed your work at {{company}} and was impressed by your background in {{industry}}.

I'm reaching out because I believe there might be an opportunity for us to collaborate on improving your team's productivity.

Would you be interested in a brief 15-minute call to discuss this further?

Best regards,
John Smith`,
    variables: ['firstName', 'company', 'industry'],
    type: 'initial'
  },
  {
    id: 'followup_1',
    name: 'First Follow-up',
    subject: 'Re: Quick question about {{company}}',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about potential collaboration opportunities.

I understand you're probably busy, but I'd love to share some insights that might be valuable for {{company}}.

Would you have 10 minutes for a quick call this week?

Best,
John Smith`,
    variables: ['firstName', 'company'],
    type: 'followup1'
  }
];

// Example configuration
const config: OutreachConfig = {
  linkedInScrapingEnabled: true,
  emailProvider: 'sendgrid',
  dailyEmailLimit: 50,
  followUpIntervals: [3, 7, 14], // Days between follow-ups
  autoReplyAnalysis: true,
  templates: emailTemplates
};

// Example usage
async function demonstrateOutreachAgent() {
  console.log('🚀 Starting OutreachAgent Demo\n');

  // Initialize the agent
  const agent = new OutreachAgent(config, logger);

  // Example 1: Scrape LinkedIn for leads
  console.log('1. Scraping LinkedIn for potential leads...');
  const scrapingResult = await agent.scrapePotentialLeads({
    keywords: ['CTO', 'VP Engineering', 'Tech Lead'],
    location: 'San Francisco',
    industry: 'Technology',
    companySize: '51-200',
    limit: 10
  });

  if (scrapingResult.success) {
    console.log(`✅ Found ${scrapingResult.data.totalFound} potential leads`);
    console.log(`📊 Scraped leads:`, scrapingResult.data.leads.map(l => `${l.firstName} ${l.lastName} - ${l.position} at ${l.company}`));
  } else {
    console.log('❌ Scraping failed:', scrapingResult.error);
  }

  // Example 2: Generate outreach sequence for a sample lead
  if (scrapingResult.success && scrapingResult.data.leads.length > 0) {
    const sampleLead = scrapingResult.data.leads[0];
    console.log(`\n2. Generating outreach sequence for ${sampleLead.firstName} ${sampleLead.lastName}...`);

    const sequenceResult = await agent.generateOutreachSequence(sampleLead);
    
    if (sequenceResult.success) {
      console.log('✅ Outreach sequence generated successfully');
      console.log(`📧 Sequence ID: ${sequenceResult.data.id}`);
      console.log(`📝 Templates in sequence: ${sequenceResult.data.templates.length}`);
      console.log(`📅 Scheduled send times:`, sequenceResult.data.scheduledSendTimes.map(d => d.toLocaleDateString()));
    } else {
      console.log('❌ Sequence generation failed:', sequenceResult.error);
    }
  }

  // Example 3: Score a lead
  if (scrapingResult.success && scrapingResult.data.leads.length > 0) {
    const sampleLead = scrapingResult.data.leads[0];
    console.log(`\n3. Scoring lead: ${sampleLead.firstName} ${sampleLead.lastName}...`);

    // First enrich the lead
    const enrichmentResult = await agent.enrichLead(sampleLead);
    
    if (enrichmentResult.success) {
      const score = agent.scoreLead(enrichmentResult.data);
      console.log('✅ Lead scored successfully');
      console.log(`🎯 Overall Score: ${score.total}/100`);
      console.log('📊 Score Breakdown:');
      Object.entries(score.factors).forEach(([factor, value]) => {
        console.log(`  - ${factor}: ${value.toFixed(1)}/100`);
      });
      console.log(`💭 Reasoning: ${score.reasoning}`);
    } else {
      console.log('❌ Lead enrichment failed:', enrichmentResult.error);
    }
  }

  // Example 4: Analyze a sample reply
  console.log('\n4. Analyzing email replies...');
  
  const sampleReplies = [
    'Thanks for reaching out! I\'d love to learn more about what you\'re offering. Can we schedule a call?',
    'Not interested right now, but thanks for the email.',
    'Can you send me more information about your solution? I\'m curious about the pricing.',
    'Please remove me from your mailing list. I\'m not interested in these types of emails.'
  ];

  for (let i = 0; i < sampleReplies.length; i++) {
    const reply = sampleReplies[i];
    const analysisResult = await agent.analyzeReply(reply, `seq_${i + 1}`);
    
    if (analysisResult.success) {
      const analysis = analysisResult.data;
      console.log(`\n📧 Reply ${i + 1}: "${reply.substring(0, 50)}..."`);
      console.log(`🏷️  Type: ${analysis.type}`);
      console.log(`😊 Sentiment: ${analysis.sentiment}`);
      console.log(`🔄 Continue Sequence: ${analysis.shouldContinueSequence ? 'Yes' : 'No'}`);
      console.log(`💡 Suggested Response: ${analysis.suggestedResponse}`);
    }
  }

  // Example 5: Create a campaign
  console.log('\n5. Creating outreach campaign...');
  
  const campaignResult = await agent.createCampaign({
    name: 'Q1 2024 Tech Leaders Outreach',
    description: 'Outreach campaign targeting technology leaders in SF Bay Area',
    templates: emailTemplates,
    leads: scrapingResult.success ? scrapingResult.data.leads.map(l => l.id) : [],
    status: 'draft'
  });

  if (campaignResult.success) {
    console.log('✅ Campaign created successfully');
    console.log(`📋 Campaign ID: ${campaignResult.data.id}`);
    console.log(`👥 Total Leads: ${campaignResult.data.metrics.totalLeads}`);
    console.log(`📊 Status: ${campaignResult.data.status}`);
  } else {
    console.log('❌ Campaign creation failed:', campaignResult.error);
  }

  console.log('\n🎉 OutreachAgent Demo Complete!');
}

// Example of using the agent with different configurations
async function demonstrateConfigurationOptions() {
  console.log('\n🔧 Configuration Options Demo\n');

  // Conservative configuration
  const conservativeConfig: OutreachConfig = {
    linkedInScrapingEnabled: false, // Disable scraping
    emailProvider: 'smtp',
    dailyEmailLimit: 20, // Lower daily limit
    followUpIntervals: [7, 14], // Fewer, spaced out follow-ups
    autoReplyAnalysis: false,
    templates: [emailTemplates[0]] // Only initial template
  };

  const conservativeAgent = new OutreachAgent(conservativeConfig, logger);
  console.log('🐌 Conservative Agent: Lower limits, fewer follow-ups, no scraping');

  // Aggressive configuration
  const aggressiveConfig: OutreachConfig = {
    linkedInScrapingEnabled: true,
    emailProvider: 'sendgrid',
    dailyEmailLimit: 200, // Higher daily limit
    followUpIntervals: [2, 5, 10, 15], // More frequent follow-ups
    autoReplyAnalysis: true,
    templates: emailTemplates // All templates
  };

  const aggressiveAgent = new OutreachAgent(aggressiveConfig, logger);
  console.log('🚀 Aggressive Agent: Higher limits, more follow-ups, full automation');
}

// Run the examples
if (require.main === module) {
  demonstrateOutreachAgent()
    .then(() => demonstrateConfigurationOptions())
    .catch(console.error);
}

export { demonstrateOutreachAgent, demonstrateConfigurationOptions };