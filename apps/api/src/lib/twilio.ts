// Mock Twilio for demonstration - in production, install: npm install twilio @types/twilio
// import twilio from 'twilio';

// Mock Twilio client for demonstration
const mockTwilio = {
  validateRequest: (authToken: string, signature: string, url: string, params: any): boolean => {
    // Mock validation - always returns true for demo
    return true;
  }
};

interface TwilioMessage {
  from: string;
  to: string;
  body: string;
  mediaUrl?: string[];
}

interface MockTwilioClient {
  messages: {
    create: (options: any) => Promise<{ sid: string }>;
    list: (options: any) => Promise<TwilioMessage[]>;
  };
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
}

interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
}

export class TwilioService {
  private client: MockTwilioClient;
  private config: TwilioConfig;

  constructor(config: TwilioConfig) {
    this.config = config;
    // Mock client for demonstration
    this.client = {
      messages: {
        create: async (options: any) => ({ sid: `mock_${Date.now()}` }),
        list: async (options: any) => []
      }
    };
    // In production: this.client = twilio(config.accountSid, config.authToken);
  }

  /**
   * Send a WhatsApp message to a customer
   */
  async sendWhatsAppMessage(to: string, message: string, mediaUrl?: string): Promise<string> {
    try {
      const messageOptions: any = {
        from: `whatsapp:${this.config.whatsappNumber}`,
        to: `whatsapp:${to}`,
        body: message,
      };

      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }

      const response = await this.client.messages.create(messageOptions);
      return response.sid;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  /**
   * Process incoming WhatsApp webhook
   */
  async processIncomingMessage(webhookData: any): Promise<{
    from: string;
    body: string;
    messageId: string;
    profileName?: string;
  }> {
    return {
      from: webhookData.From?.replace('whatsapp:', '') || '',
      body: webhookData.Body || '',
      messageId: webhookData.MessageSid || '',
      profileName: webhookData.ProfileName || 'Unknown Customer'
    };
  }

  /**
   * Send AI support response via WhatsApp
   */
  async sendAIResponse(
    customerPhone: string, 
    response: string, 
    isEscalation: boolean = false
  ): Promise<string> {
    let message = response;
    
    if (isEscalation) {
      message += '\n\n🤖 This conversation has been escalated to one of our human agents who will contact you shortly.';
    } else {
      message += '\n\n🤖 Powered by AI Support';
    }

    return this.sendWhatsAppMessage(customerPhone, message);
  }

  /**
   * Validate Twilio webhook signature for security
   */
  validateWebhook(signature: string, url: string, params: any): boolean {
    try {
      return mockTwilio.validateRequest(this.config.authToken, signature, url, params);
    } catch (error) {
      console.error('Webhook validation failed:', error);
      return false;
    }
  }

  /**
   * Get conversation history from Twilio
   */
  async getConversationHistory(customerPhone: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    try {
      const messages = await this.client.messages.list({
        from: `whatsapp:${customerPhone}`,
        to: `whatsapp:${this.config.whatsappNumber}`,
        limit
      });

      return messages.map((msg: TwilioMessage) => ({
        from: msg.from,
        to: msg.to,
        body: msg.body || '',
        mediaUrl: msg.mediaUrl?.[0]
      }));
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }
}

// Factory function to create TwilioService instance
export function createTwilioService(): TwilioService | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappNumber) {
    console.warn('Twilio credentials not configured. WhatsApp integration disabled.');
    return null;
  }

  return new TwilioService({
    accountSid,
    authToken,
    whatsappNumber
  });
}