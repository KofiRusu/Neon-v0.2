import { jest } from '@jest/globals';

// Mock context type based on expected tRPC context structure
interface MockContext {
  prisma: any;
  session: any;
  logger: any;
}

export function createTRPCMockContext(): MockContext {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      agent: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      agentExecution: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      campaign: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      content: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      analytics: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      lead: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      trend: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      abTest: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      designTemplate: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    } as any,
    session: null,
    logger: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    },
  };
}

export function createMockUser() {
  return {
    id: 'user1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createMockSession(user = createMockUser()) {
  return {
    user,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
  };
}

export function createMockAgent() {
  return {
    id: 'agent1',
    name: 'Test Agent',
    type: 'CONTENT',
    status: 'ACTIVE',
    capabilities: {},
    settings: {},
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createMockCampaign() {
  return {
    id: 'campaign1',
    name: 'Test Campaign',
    description: 'Test campaign description',
    type: 'SOCIAL_MEDIA',
    status: 'ACTIVE',
    budget: 1000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createMockExecution() {
  return {
    id: 'execution1',
    agentId: 'agent1',
    campaignId: 'campaign1',
    userId: 'user1',
    task: 'test_task',
    payload: {},
    result: null,
    status: 'PENDING',
    performance: null,
    error: null,
    startedAt: new Date(),
    completedAt: null,
    metadata: {},
  };
}