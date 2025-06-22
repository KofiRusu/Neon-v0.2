import { AbstractAgent, AgentPayload, AgentResult } from '../base-agent';

export interface SupportContext {
  threadId?: string;
  customerName?: string;
  customerEmail?: string;
  message: string;
  channel: 'WEB_CHAT' | 'EMAIL' | 'WHATSAPP' | 'PHONE' | 'SOCIAL_MEDIA';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  previousMessages?: Array<{
    content: string;
    senderType: 'CUSTOMER' | 'AGENT' | 'AI_AGENT';
    timestamp: string;
  }>;
}

export interface SupportResponse {
  response: string;
  confidence: number;
  shouldEscalate: boolean;
  escalationReason?: string;
  suggestedCategory?: string;
  suggestedPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  followUpQuestions?: string[];
  relatedArticles?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
}

export class CustomerSupportAgent extends AbstractAgent {
  private knowledgeBase: Map<string, string[]>;
  private escalationKeywords: string[];
  private confidenceThreshold: number = 0.7;

  constructor(id: string, name: string) {
    super(id, name, 'support', [
      'respond_to_inquiry',
      'classify_request',
      'escalate_to_human',
      'search_knowledge_base',
      'analyze_sentiment',
      'generate_followup'
    ]);

    // Initialize knowledge base with common support topics
    this.knowledgeBase = new Map([
      ['billing', [
        'For billing inquiries, please check your account dashboard',
        'Payment issues can be resolved by updating your payment method',
        'Refunds are processed within 3-5 business days'
      ]],
      ['technical', [
        'Have you tried clearing your browser cache?',
        'Please ensure you\'re using the latest version of your browser',
        'Try logging out and logging back in'
      ]],
      ['account', [
        'You can reset your password using the forgot password link',
        'Account settings can be updated in your profile section',
        'To delete your account, please contact our support team'
      ]],
      ['features', [
        'Our platform offers advanced AI agents for marketing automation',
        'You can create campaigns using our intuitive dashboard',
        'Analytics and insights are available in real-time'
      ]]
    ]);

    this.escalationKeywords = [
      'angry', 'frustrated', 'complaint', 'legal', 'lawsuit',
      'refund', 'cancel', 'delete account', 'speak to manager',
      'unacceptable', 'terrible', 'worst', 'hate'
    ];
  }

  async execute(payload: AgentPayload): Promise<AgentResult> {
    return this.executeWithErrorHandling(payload, async () => {
      const { task, context } = payload;
      
      switch (task) {
        case 'respond_to_inquiry':
          return await this.respondToInquiry(context as SupportContext);
        case 'classify_request':
          return await this.classifyRequest(context as SupportContext);
        case 'escalate_to_human':
          return await this.escalateToHuman(context as SupportContext);
        case 'search_knowledge_base':
          return await this.searchKnowledgeBase(context as SupportContext);
        case 'analyze_sentiment':
          return await this.analyzeSentiment(context as SupportContext);
        case 'generate_followup':
          return await this.generateFollowup(context as SupportContext);
        default:
          throw new Error(`Unknown task: ${task}`);
      }
    });
  }

  private async respondToInquiry(context: SupportContext): Promise<SupportResponse> {
    const { message, previousMessages = [] } = context;
    
    // Analyze sentiment first
    const sentiment = await this.analyzeSentiment(context);
    const shouldEscalate = this.shouldEscalateBasedOnSentiment(sentiment.sentiment);
    
    if (shouldEscalate) {
      return {
        response: "I understand you're having a frustrating experience. Let me connect you with one of our human agents who can better assist you.",
        confidence: 1.0,
        shouldEscalate: true,
        escalationReason: 'CUSTOMER_REQUEST',
        suggestedPriority: 'HIGH'
      };
    }

    // Classify the request to find the best response
    const classification = await this.classifyRequest(context);
    const category = classification.category;
    
    // Search knowledge base for relevant responses
    const knowledge = this.knowledgeBase.get(category) || [];
    const bestResponse = knowledge[0] || "I'm here to help! Could you please provide more details about your issue?";
    
    // Calculate confidence based on keyword matching
    const confidence = this.calculateConfidence(message, category);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(category);
    
    const shouldEscalateForConfidence = confidence < this.confidenceThreshold;
    const baseResponse = {
      response: bestResponse,
      confidence,
      shouldEscalate: shouldEscalateForConfidence,
      suggestedCategory: classification.category,
      suggestedPriority: classification.priority,
      followUpQuestions,
      relatedArticles: this.findRelatedArticles(category)
    };

    return shouldEscalateForConfidence 
      ? { ...baseResponse, escalationReason: 'AI_LIMITATION' as const }
      : baseResponse;
  }

  private async classifyRequest(context: SupportContext): Promise<{
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    confidence: number;
  }> {
    const { message } = context;
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based classification
    let category = 'general';
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    
    if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('invoice')) {
      category = 'billing';
      priority = 'HIGH';
    } else if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('broken')) {
      category = 'technical';
      priority = 'HIGH';
    } else if (lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('password')) {
      category = 'account';
      priority = 'MEDIUM';
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('how to') || lowerMessage.includes('tutorial')) {
      category = 'features';
      priority = 'LOW';
    }
    
    // Check for urgent keywords
    const urgentKeywords = ['urgent', 'emergency', 'critical', 'immediately', 'asap'];
    if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      priority = 'URGENT';
    }
    
    return {
      category,
      priority,
      confidence: this.calculateConfidence(message, category)
    };
  }

  private async escalateToHuman(context: SupportContext): Promise<{
    escalated: boolean;
    reason: string;
    assignedAgent?: string;
    estimatedWaitTime?: string;
  }> {
    // In a real implementation, this would integrate with your agent assignment system
    return {
      escalated: true,
      reason: 'Customer request or AI confidence below threshold',
      estimatedWaitTime: '5-10 minutes'
    };
  }

  private async searchKnowledgeBase(context: SupportContext): Promise<{
    articles: Array<{
      title: string;
      content: string;
      relevance: number;
    }>;
  }> {
    const { message } = context;
    const classification = await this.classifyRequest(context);
    
    // Mock knowledge base search
    const mockArticles = [
      {
        title: `How to resolve ${classification.category} issues`,
        content: `Detailed guide for ${classification.category} problems...`,
        relevance: 0.9
      },
      {
        title: `${classification.category} FAQ`,
        content: `Frequently asked questions about ${classification.category}...`,
        relevance: 0.8
      }
    ];
    
    return { articles: mockArticles };
  }

  private async analyzeSentiment(context: SupportContext): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    emotions: string[];
  }> {
    const { message } = context;
    const lowerMessage = message.toLowerCase();
    
    // Simple sentiment analysis
    const positiveWords = ['happy', 'great', 'excellent', 'love', 'perfect', 'amazing'];
    const negativeWords = ['angry', 'frustrated', 'terrible', 'awful', 'hate', 'worst', 'horrible'];
    
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let score = 0;
    
    if (negativeCount > positiveCount) {
      sentiment = 'negative';
      score = -0.5;
    } else if (positiveCount > negativeCount) {
      sentiment = 'positive';
      score = 0.5;
    }
    
    const emotions = [];
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated')) {
      emotions.push('frustrated');
    }
    if (lowerMessage.includes('confused')) {
      emotions.push('confused');
    }
    
    return { sentiment, score, emotions };
  }

  private async generateFollowup(context: SupportContext): Promise<{
    questions: string[];
    suggestedActions: string[];
  }> {
    const classification = await this.classifyRequest(context);
    
    const questionMap: Record<string, string[]> = {
      billing: [
        "What specific billing issue are you experiencing?",
        "Can you provide your account number or email?",
        "When did you first notice this billing problem?"
      ],
      technical: [
        "What browser are you using?",
        "Have you tried refreshing the page?",
        "Are you seeing any specific error messages?"
      ],
      account: [
        "What account-related issue can I help you with?",
        "Have you tried resetting your password?",
        "Are you able to access your account dashboard?"
      ],
      features: [
        "Which feature would you like to learn more about?",
        "Are you looking for a tutorial or documentation?",
        "What specific outcome are you trying to achieve?"
      ]
    };
    
    return {
      questions: questionMap[classification.category] || [
        "Could you provide more details about your issue?",
        "What would you like me to help you with today?"
      ],
      suggestedActions: [
        "Check our help documentation",
        "Try the suggested troubleshooting steps",
        "Contact our technical support team if the issue persists"
      ]
    };
  }

  private shouldEscalateBasedOnSentiment(sentiment: 'positive' | 'neutral' | 'negative'): boolean {
    return sentiment === 'negative';
  }

  private calculateConfidence(message: string, category: string): number {
    const lowerMessage = message.toLowerCase();
    const categoryKeywords = this.getCategoryKeywords(category);
    
    const matchingKeywords = categoryKeywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    return Math.min(matchingKeywords.length / categoryKeywords.length, 1.0);
  }

  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      billing: ['billing', 'payment', 'invoice', 'charge', 'refund', 'subscription'],
      technical: ['bug', 'error', 'broken', 'not working', 'crash', 'issue'],
      account: ['account', 'login', 'password', 'profile', 'settings'],
      features: ['feature', 'how to', 'tutorial', 'guide', 'help', 'documentation']
    };
    
    return keywordMap[category] || [];
  }

  private generateFollowUpQuestions(category: string): string[] {
    const questionMap: Record<string, string[]> = {
      billing: ["Would you like me to explain the charges on your account?"],
      technical: ["Have you tried the basic troubleshooting steps?"],
      account: ["Do you need help with account settings?"],
      features: ["Would you like a quick tutorial on this feature?"]
    };
    
    return questionMap[category] || ["Is there anything else I can help you with?"];
  }

  private findRelatedArticles(category: string): Array<{
    title: string;
    url: string;
    relevance: number;
  }> {
    // Mock related articles - in real implementation, this would query your knowledge base
    return [
      {
        title: `${category} Help Guide`,
        url: `/help/${category}`,
        relevance: 0.9
      },
      {
        title: `${category} FAQ`,
        url: `/faq/${category}`,
        relevance: 0.8
      }
    ];
  }
}