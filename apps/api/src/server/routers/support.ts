import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

// Mock support agent for now - in real implementation, this would import from core-agents
const supportAgent = {
  async execute(payload: any) {
    // Mock AI response based on message content
    const message = payload.context?.message?.toLowerCase() || '';
    const shouldEscalate = message.includes('angry') || message.includes('frustrated') || message.includes('complaint');
    
    const baseResponse = {
      response: shouldEscalate 
        ? "I understand you're having difficulties. Let me connect you with one of our human agents who can better assist you."
        : "Thank you for contacting support! I'm here to help you with your inquiry.",
      confidence: shouldEscalate ? 0.9 : 0.8,
      shouldEscalate,
      suggestedCategory: 'general',
      suggestedPriority: shouldEscalate ? 'HIGH' as const : 'MEDIUM' as const,
      followUpQuestions: ['Is there anything specific I can help you with?'],
      relatedArticles: [],
    };

    return shouldEscalate 
      ? { ...baseResponse, escalationReason: 'CUSTOMER_REQUEST' as const }
      : baseResponse;
  }
};

// Input validation schemas
const chatMessageSchema = z.object({
  threadId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  channel: z.enum(['WEB_CHAT', 'EMAIL', 'WHATSAPP', 'PHONE', 'SOCIAL_MEDIA']).default('WEB_CHAT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.string().optional(),
});

const assignAgentSchema = z.object({
  threadId: z.string(),
  agentId: z.string(),
  reason: z.string().optional(),
});

const createThreadSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  channel: z.enum(['WEB_CHAT', 'EMAIL', 'WHATSAPP', 'PHONE', 'SOCIAL_MEDIA']).default('WEB_CHAT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.string().optional(),
  initialMessage: z.string().min(1, 'Initial message is required'),
});

const escalateSchema = z.object({
  threadId: z.string(),
  reason: z.enum(['COMPLEX_ISSUE', 'CUSTOMER_REQUEST', 'AI_LIMITATION', 'TECHNICAL_ISSUE', 'BILLING_DISPUTE', 'COMPLAINT', 'URGENT_MATTER']),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('HIGH'),
});

export const supportRouter = router({
  // Create new support thread
  createThread: publicProcedure
    .input(createThreadSchema)
    .mutation(async ({ input, ctx }) => {
      // In real implementation, this would create in database
      const threadId = `thread_${Date.now()}`;
      
      // Mock thread creation
      const thread = {
        id: threadId,
        subject: input.subject,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        status: 'OPEN' as const,
        priority: input.priority,
        category: input.category,
        channel: input.channel,
        isAiAssisted: true,
        assignedAgentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Process initial message with AI
      const aiResponse = await supportAgent.execute({
        task: 'respond_to_inquiry',
        context: {
          threadId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          message: input.initialMessage,
          channel: input.channel,
          priority: input.priority,
          category: input.category,
        }
      });

      // Mock message creation
      const messages = [
        {
          id: `msg_${Date.now()}_1`,
          threadId,
          senderId: null,
          senderType: 'CUSTOMER' as const,
          senderName: input.customerName || 'Anonymous',
          content: input.initialMessage,
          messageType: 'TEXT' as const,
          aiGenerated: false,
          createdAt: new Date(),
        },
        {
          id: `msg_${Date.now()}_2`,
          threadId,
          senderId: 'ai-support',
          senderType: 'AI_AGENT' as const,
          senderName: 'Support AI',
          content: aiResponse.response,
          messageType: 'TEXT' as const,
          aiGenerated: true,
          aiConfidence: aiResponse.confidence,
          createdAt: new Date(),
        }
      ];

      return {
        thread,
        messages,
        aiResponse,
      };
    }),

  // Send message in existing thread
  chat: publicProcedure
    .input(chatMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { threadId, message, ...context } = input;
      
      // Get AI response
      const aiResponse = await supportAgent.execute({
        task: 'respond_to_inquiry',
        context: {
          ...context,
          threadId,
          message,
        }
      });

      // Mock message creation
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        threadId: threadId || `thread_${Date.now()}`,
        senderId: null,
        senderType: 'CUSTOMER' as const,
        senderName: context.customerName || 'Anonymous',
        content: message,
        messageType: 'TEXT' as const,
        aiGenerated: false,
        createdAt: new Date(),
      };

      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        threadId: threadId || `thread_${Date.now()}`,
        senderId: 'ai-support',
        senderType: 'AI_AGENT' as const,
        senderName: 'Support AI',
        content: aiResponse.response,
        messageType: 'TEXT' as const,
        aiGenerated: true,
        aiConfidence: aiResponse.confidence,
        createdAt: new Date(),
      };

             // Handle escalation if needed
       let escalation = null;
       if (aiResponse.shouldEscalate) {
         const reason = 'escalationReason' in aiResponse ? aiResponse.escalationReason : 'AI_LIMITATION';
         escalation = {
           id: `esc_${Date.now()}`,
           threadId: threadId || `thread_${Date.now()}`,
           reason,
           description: `AI confidence: ${aiResponse.confidence}. Escalating to human agent.`,
           status: 'PENDING' as const,
           priority: aiResponse.suggestedPriority || 'MEDIUM',
           createdAt: new Date(),
         };
       }

      return {
        userMessage,
        aiMessage,
        aiResponse,
        escalation,
      };
    }),

  // Assign human agent to thread
  assignAgent: protectedProcedure
    .input(assignAgentSchema)
    .mutation(async ({ input, ctx }) => {
      const { threadId, agentId, reason } = input;
      
      // Mock agent assignment
      const assignment = {
        threadId,
        assignedAgentId: agentId,
        assignedAt: new Date(),
        assignedBy: ctx.session.user.id,
        reason,
      };

      // Mock notification message
      const systemMessage = {
        id: `msg_${Date.now()}_system`,
        threadId,
        senderId: agentId,
        senderType: 'SYSTEM' as const,
        senderName: 'System',
        content: `Human agent has been assigned to this conversation. ${ctx.session.user.name} will assist you shortly.`,
        messageType: 'SYSTEM_NOTIFICATION' as const,
        aiGenerated: false,
        isInternal: false,
        createdAt: new Date(),
      };

      return {
        assignment,
        systemMessage,
      };
    }),

  // Escalate thread to human agent
  escalate: publicProcedure
    .input(escalateSchema)
    .mutation(async ({ input, ctx }) => {
      const { threadId, reason, description, priority } = input;
      
      // Create escalation request
      const escalation = {
        id: `esc_${Date.now()}`,
        threadId,
        reason,
        description,
        status: 'PENDING' as const,
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create system message
      const systemMessage = {
        id: `msg_${Date.now()}_escalation`,
        threadId,
        senderId: null,
        senderType: 'SYSTEM' as const,
        senderName: 'System',
        content: `This conversation has been escalated to our human support team. Reason: ${reason}. You will be contacted shortly.`,
        messageType: 'SYSTEM_NOTIFICATION' as const,
        aiGenerated: false,
        isInternal: false,
        createdAt: new Date(),
      };

      return {
        escalation,
        systemMessage,
      };
    }),

  // Get thread by ID
  getThread: publicProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock thread retrieval
      return {
        id: input.threadId,
        subject: 'Sample Support Thread',
        status: 'OPEN' as const,
        priority: 'MEDIUM' as const,
        channel: 'WEB_CHAT' as const,
        isAiAssisted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: `msg_1`,
            threadId: input.threadId,
            senderType: 'CUSTOMER' as const,
            senderName: 'Customer',
            content: 'I need help with my account',
            messageType: 'TEXT' as const,
            aiGenerated: false,
            createdAt: new Date(),
          }
        ],
      };
    }),

  // Get all threads (for support dashboard)
  getThreads: protectedProcedure
    .input(z.object({
      status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_AGENT', 'RESOLVED', 'CLOSED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      assignedToMe: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Mock threads list
      return {
        threads: [
          {
            id: 'thread_1',
            subject: 'Billing Question',
            status: 'OPEN' as const,
            priority: 'MEDIUM' as const,
            channel: 'WEB_CHAT' as const,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            isAiAssisted: true,
            assignedAgentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: {
              messages: 3,
              escalations: 0,
            }
          }
        ],
        total: 1,
        hasMore: false,
      };
    }),

  // Get escalations
  getEscalations: protectedProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']).optional(),
      assignedToMe: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Mock escalations
      return {
        escalations: [
          {
            id: 'esc_1',
            threadId: 'thread_1',
            reason: 'COMPLEX_ISSUE' as const,
            description: 'Customer needs advanced technical support',
            status: 'PENDING' as const,
            priority: 'HIGH' as const,
            createdAt: new Date(),
            thread: {
              subject: 'Technical Issue',
              customerName: 'Jane Smith',
              customerEmail: 'jane@example.com',
            }
          }
        ],
        total: 1,
        hasMore: false,
      };
    }),

  // Analyze sentiment of message
  analyzeSentiment: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await supportAgent.execute({
        task: 'analyze_sentiment',
        context: {
          message: input.message,
          channel: 'WEB_CHAT',
        }
      });

      return result;
    }),

  // Search knowledge base
  searchKnowledge: publicProcedure
    .input(z.object({ 
      query: z.string().min(1, 'Query is required'),
      category: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const result = await supportAgent.execute({
        task: 'search_knowledge_base',
        context: {
          message: input.query,
          channel: 'WEB_CHAT',
          category: input.category,
        }
      });

      return result;
    }),
});