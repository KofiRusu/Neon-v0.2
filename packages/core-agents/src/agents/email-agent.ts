import { AbstractAgent, AgentPayload, AgentResult } from '../base-agent';
import { z } from 'zod';

// Email generation schemas
export const EmailGenerationPayloadSchema = z.object({
  task: z.literal('generate'),
  campaignData: z.object({
    name: z.string(),
    type: z.string(),
    audience: z.record(z.any()).optional(),
    context: z.record(z.any()).optional(),
  }),
  tone: z.enum(['professional', 'casual', 'urgent', 'friendly', 'promotional']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  includePersonalization: z.boolean().default(true),
});

export const EmailSendPayloadSchema = z.object({
  task: z.literal('send'),
  emailCampaignId: z.string(),
  recipientEmail: z.string(),
  recipientName: z.string().optional(),
  personalizedVariables: z.record(z.any()).optional(),
  scheduleAt: z.date().optional(),
});

export const EmailSchedulePayloadSchema = z.object({
  task: z.literal('schedule'),
  emailCampaignId: z.string(),
  scheduleAt: z.date(),
  recipients: z.array(z.object({
    email: z.string(),
    name: z.string().optional(),
    variables: z.record(z.any()).optional(),
  })),
});

export const EmailTrackPayloadSchema = z.object({
  task: z.literal('track'),
  emailCampaignId: z.string().optional(),
  logId: z.string().optional(),
  event: z.enum(['sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed']).optional(),
});

export type EmailAgentPayload = 
  | z.infer<typeof EmailGenerationPayloadSchema>
  | z.infer<typeof EmailSendPayloadSchema>
  | z.infer<typeof EmailSchedulePayloadSchema>
  | z.infer<typeof EmailTrackPayloadSchema>;

export interface EmailService {
  send(params: {
    to: string;
    from: string;
    subject: string;
    content: string;
    html?: string;
    trackingEnabled?: boolean;
  }): Promise<{ messageId: string; status: string }>;
  
  getDeliveryStatus(messageId: string): Promise<{
    status: string;
    events: Array<{
      event: string;
      timestamp: Date;
      reason?: string;
    }>;
  }>;
}

export class SendGridService implements EmailService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async send(params: {
    to: string;
    from: string;
    subject: string;
    content: string;
    html?: string;
    trackingEnabled?: boolean;
  }): Promise<{ messageId: string; status: string }> {
    // SendGrid API implementation
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: params.to }],
        }],
        from: { email: params.from },
        subject: params.subject,
        content: [
          { type: 'text/plain', value: params.content },
          ...(params.html ? [{ type: 'text/html', value: params.html }] : []),
        ],
        tracking_settings: {
          click_tracking: { enable: params.trackingEnabled ?? true },
          open_tracking: { enable: params.trackingEnabled ?? true },
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }
    
    const messageId = response.headers.get('x-message-id') || 'unknown';
    return { messageId, status: 'sent' };
  }
  
  async getDeliveryStatus(messageId: string): Promise<{
    status: string;
    events: Array<{ event: string; timestamp: Date; reason?: string }>;
  }> {
    // Mock implementation - in real scenario, would use SendGrid Event API
    return {
      status: 'delivered',
      events: [
        { event: 'sent', timestamp: new Date() },
        { event: 'delivered', timestamp: new Date() },
      ],
    };
  }
}

export class MailgunService implements EmailService {
  private apiKey: string;
  private domain: string;
  
  constructor(apiKey: string, domain: string) {
    this.apiKey = apiKey;
    this.domain = domain;
  }
  
  async send(params: {
    to: string;
    from: string;
    subject: string;
    content: string;
    html?: string;
    trackingEnabled?: boolean;
  }): Promise<{ messageId: string; status: string }> {
    // Mailgun API implementation
    const formData = new FormData();
    formData.append('from', params.from);
    formData.append('to', params.to);
    formData.append('subject', params.subject);
    formData.append('text', params.content);
    if (params.html) {
      formData.append('html', params.html);
    }
    if (params.trackingEnabled) {
      formData.append('o:tracking', 'yes');
      formData.append('o:tracking-clicks', 'yes');
      formData.append('o:tracking-opens', 'yes');
    }
    
    const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Mailgun API error: ${response.statusText}`);
    }
    
    const result = await response.json() as { id: string; message: string };
    return { messageId: result.id, status: 'sent' };
  }
  
  async getDeliveryStatus(messageId: string): Promise<{
    status: string;
    events: Array<{ event: string; timestamp: Date; reason?: string }>;
  }> {
    // Mock implementation - in real scenario, would use Mailgun Events API
    return {
      status: 'delivered',
      events: [
        { event: 'sent', timestamp: new Date() },
        { event: 'delivered', timestamp: new Date() },
      ],
    };
  }
}

export class EmailMarketingAgent extends AbstractAgent {
  private emailService: EmailService;
  
  constructor(id: string, name: string, emailService: EmailService) {
    super(id, name, 'EMAIL', [
      'generate_subject_lines',
      'generate_email_content',
      'personalize_content',
      'send_emails',
      'schedule_emails',
      'track_delivery',
      'optimize_send_times',
      'a_b_test_content',
    ]);
    this.emailService = emailService;
  }
  
  async execute(payload: AgentPayload): Promise<AgentResult> {
    return this.executeWithErrorHandling(payload, async () => {
      const emailPayload = payload as EmailAgentPayload;
      
      switch (emailPayload.task) {
        case 'generate':
          return await this.generateEmailContent(emailPayload);
        case 'send':
          return await this.sendEmail(emailPayload);
        case 'schedule':
          return await this.scheduleEmail(emailPayload);
        case 'track':
          return await this.trackEmail(emailPayload);
        default:
          throw new Error(`Unknown task: ${(emailPayload as any).task}`);
      }
    });
  }
  
  private async generateEmailContent(payload: z.infer<typeof EmailGenerationPayloadSchema>) {
    const { campaignData, tone = 'professional', length = 'medium', includePersonalization } = payload;
    
    // AI-powered subject line generation
    const subjectLines = await this.generateSubjectLines(campaignData, tone);
    
    // AI-powered email content generation
    const emailContent = await this.generateEmailBody(campaignData, tone, length);
    
    // Add personalization variables if requested
    const personalizedContent = includePersonalization 
      ? this.addPersonalizationVariables(emailContent)
      : emailContent;
    
    return {
      subjectLines,
      content: personalizedContent,
      personalizedContent,
      variables: includePersonalization ? this.extractPersonalizationVariables() : {},
      metadata: {
        tone,
        length,
        campaignType: campaignData.type,
        generatedAt: new Date().toISOString(),
      },
    };
  }
  
  private async generateSubjectLines(campaignData: any, tone: string): Promise<string[]> {
    // AI-powered subject line generation logic
    const baseSubjects = [
      `Exclusive ${campaignData.name} - Don't Miss Out!`,
      `Your ${campaignData.name} Update is Here`,
      `Limited Time: ${campaignData.name} Offer`,
      `Breaking: ${campaignData.name} News`,
      `${campaignData.name} - Special Announcement`,
    ];
    
    // Apply tone modifications
    const toneModifiers = {
      professional: (subject: string) => subject.replace(/!+$/, '.'),
      casual: (subject: string) => subject.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      urgent: (subject: string) => `⚡ ${subject} ⚡`,
      friendly: (subject: string) => `Hey! ${subject} 😊`,
      promotional: (subject: string) => `🎉 ${subject} - Save Now!`,
    };
    
    return baseSubjects.map(subject => 
      toneModifiers[tone as keyof typeof toneModifiers]?.(subject) || subject
    );
  }
  
  private async generateEmailBody(campaignData: any, tone: string, length: string): Promise<string> {
    // AI-powered email content generation
    const templates = {
      short: `Hi {{name}},

{{campaign_intro}}

{{call_to_action}}

Best regards,
{{sender_name}}`,
      medium: `Hi {{name}},

I hope this email finds you well!

{{campaign_intro}}

{{campaign_details}}

{{call_to_action}}

If you have any questions, feel free to reach out.

Best regards,
{{sender_name}}
{{company_name}}`,
      long: `Hi {{name}},

I hope you're having a great day!

{{campaign_intro}}

{{campaign_details}}

Here's what this means for you:
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}

{{call_to_action}}

We're here to help if you need anything. Don't hesitate to reach out with questions.

Looking forward to hearing from you!

Best regards,
{{sender_name}}
{{company_name}}
{{contact_info}}`,
    };
    
    return templates[length as keyof typeof templates] || templates.medium;
  }
  
  private addPersonalizationVariables(content: string): string {
    // Add common personalization variables
    const variables = [
      '{{name}}',
      '{{first_name}}',
      '{{last_name}}',
      '{{company}}',
      '{{position}}',
      '{{location}}',
      '{{campaign_name}}',
      '{{sender_name}}',
      '{{company_name}}',
    ];
    
    return content; // Already contains personalization variables in the templates
  }
  
  private extractPersonalizationVariables(): Record<string, string> {
    return {
      name: 'Full name of the recipient',
      first_name: 'First name of the recipient', 
      last_name: 'Last name of the recipient',
      company: 'Company name',
      position: 'Job title/position',
      location: 'Location/city',
      campaign_name: 'Name of the campaign',
      sender_name: 'Name of the sender',
      company_name: 'Sender company name',
      campaign_intro: 'Campaign introduction text',
      campaign_details: 'Detailed campaign information',
      call_to_action: 'Call to action text',
      benefit_1: 'First key benefit',
      benefit_2: 'Second key benefit', 
      benefit_3: 'Third key benefit',
      contact_info: 'Contact information',
    };
  }
  
  private async sendEmail(payload: z.infer<typeof EmailSendPayloadSchema>) {
    const { emailCampaignId, recipientEmail, recipientName, personalizedVariables, scheduleAt } = payload;
    
    if (scheduleAt && scheduleAt > new Date()) {
      // Schedule for later
      return await this.scheduleEmailForLater(payload);
    }
    
    // Get email campaign data (would normally come from database)
    const campaignData = await this.getEmailCampaignData(emailCampaignId);
    
    // Personalize content
    const personalizedContent = this.personalizeContent(
      campaignData.content,
      personalizedVariables || {},
      recipientName
    );
    
    // Send via email service
    const result = await this.emailService.send({
      to: recipientEmail,
      from: campaignData.fromEmail || 'noreply@neonhub.ai',
      subject: campaignData.subject,
      content: personalizedContent,
      html: this.convertToHtml(personalizedContent),
      trackingEnabled: true,
    });
    
    // Log the send (would normally save to database)
    await this.logEmailSend({
      emailCampaignId,
      recipientEmail,
      recipientName,
      personalizedContent,
      externalId: result.messageId,
      status: 'sent',
    });
    
    return {
      messageId: result.messageId,
      status: result.status,
      recipientEmail,
      sentAt: new Date().toISOString(),
    };
  }
  
  private async scheduleEmail(payload: z.infer<typeof EmailSchedulePayloadSchema>) {
    const { emailCampaignId, scheduleAt, recipients } = payload;
    
    // Create scheduled jobs for each recipient
    const scheduledJobs = await Promise.all(
      recipients.map(async (recipient) => {
        return await this.scheduleEmailForRecipient(
          emailCampaignId,
          recipient,
          scheduleAt
        );
      })
    );
    
    return {
      scheduledCount: scheduledJobs.length,
      scheduleAt: scheduleAt.toISOString(),
      recipients: recipients.map(r => r.email),
      jobIds: scheduledJobs.map(job => job.id),
    };
  }
  
  private async trackEmail(payload: z.infer<typeof EmailTrackPayloadSchema>) {
    const { emailCampaignId, logId, event } = payload;
    
    if (logId) {
      // Track specific email log
      return await this.trackEmailLog(logId, event);
    }
    
    if (emailCampaignId) {
      // Get campaign tracking stats
      return await this.getCampaignTrackingStats(emailCampaignId);
    }
    
    throw new Error('Either emailCampaignId or logId must be provided for tracking');
  }
  
  // Helper methods (would integrate with actual database and services)
  private async getEmailCampaignData(campaignId: string) {
    // Mock data - would fetch from database
    return {
      id: campaignId,
      subject: 'Your Campaign Update',
      content: 'Hi {{name}}, this is your campaign update...',
      fromEmail: 'campaigns@neonhub.ai',
    };
  }
  
  private personalizeContent(content: string, variables: Record<string, any>, recipientName?: string): string {
    let personalizedContent = content;
    
    // Add recipient name if provided
    if (recipientName) {
      variables.name = recipientName;
      variables.first_name = recipientName.split(' ')[0];
    }
    
    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalizedContent = personalizedContent.replace(regex, String(value));
    });
    
    return personalizedContent;
  }
  
  private convertToHtml(textContent: string): string {
    // Convert plain text to basic HTML
    return textContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }
  
  private async scheduleEmailForLater(payload: z.infer<typeof EmailSendPayloadSchema>) {
    // Would integrate with job queue (Bull, Agenda, etc.)
    return {
      scheduled: true,
      scheduleAt: payload.scheduleAt?.toISOString(),
      recipientEmail: payload.recipientEmail,
      jobId: `email_${Date.now()}`,
    };
  }
  
  private async scheduleEmailForRecipient(campaignId: string, recipient: any, scheduleAt: Date) {
    // Would create scheduled job
    return {
      id: `job_${Date.now()}_${Math.random()}`,
      campaignId,
      recipient: recipient.email,
      scheduleAt,
    };
  }
  
  private async logEmailSend(logData: any) {
    // Would save to database
    console.log('Email send logged:', logData);
  }
  
  private async trackEmailLog(logId: string, event?: string) {
    // Would fetch and update email log
    return {
      logId,
      event,
      status: 'tracked',
      timestamp: new Date().toISOString(),
    };
  }
  
  private async getCampaignTrackingStats(campaignId: string) {
    // Would fetch campaign statistics from database
    return {
      campaignId,
      totalSent: 150,
      totalDelivered: 148,
      totalOpened: 89,
      totalClicked: 23,
      totalBounced: 2,
      totalUnsubscribed: 1,
      deliveryRate: 98.7,
      openRate: 60.1,
      clickRate: 15.3,
      bounceRate: 1.3,
      unsubscribeRate: 0.7,
    };
  }
}