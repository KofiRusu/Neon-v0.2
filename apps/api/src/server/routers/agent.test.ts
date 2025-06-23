import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TRPCError } from '@trpc/server';
import { agentRouter } from './agent';
import { createTRPCMockContext } from '../__test__/helpers/mock-context';

// Mock the AgentManager
jest.mock('@neonhub/core-agents', () => ({
  AgentManager: jest.fn().mockImplementation(() => ({
    getAgent: jest.fn(),
  })),
}));

describe('agentRouter', () => {
  let mockContext: any;
  let mockAgentManager: any;

  beforeEach(() => {
    mockContext = createTRPCMockContext();
    mockAgentManager = {
      getAgent: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all agents successfully', async () => {
      const mockAgents = [
        { id: '1', name: 'Content Agent', type: 'CONTENT', status: 'ACTIVE', createdAt: new Date() },
        { id: '2', name: 'SEO Agent', type: 'SEO', status: 'ACTIVE', createdAt: new Date() },
      ];
      
      mockContext.prisma.agent.findMany.mockResolvedValue(mockAgents);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.getAll();

      expect(result).toEqual(mockAgents);
      expect(mockContext.prisma.agent.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors gracefully', async () => {
      mockContext.prisma.agent.findMany.mockRejectedValue(new Error('Database error'));

      const caller = agentRouter.createCaller(mockContext);

      await expect(caller.getAll()).rejects.toThrow(TRPCError);
      expect(mockContext.logger.error).toHaveBeenCalledWith('Failed to fetch agents:', expect.any(Error));
    });
  });

  describe('getById', () => {
    it('should return agent by id with executions', async () => {
      const mockAgent = {
        id: '1',
        name: 'Content Agent',
        type: 'CONTENT',
        status: 'ACTIVE',
        executions: [
          { id: 'exec1', status: 'COMPLETED', startedAt: new Date() },
        ],
      };

      mockContext.prisma.agent.findUnique.mockResolvedValue(mockAgent);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.getById({ id: '1' });

      expect(result).toEqual(mockAgent);
      expect(mockContext.prisma.agent.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          executions: {
            orderBy: { startedAt: 'desc' },
            take: 10,
          },
        },
      });
    });

    it('should throw NOT_FOUND when agent does not exist', async () => {
      mockContext.prisma.agent.findUnique.mockResolvedValue(null);

      const caller = agentRouter.createCaller(mockContext);

      await expect(caller.getById({ id: 'nonexistent' })).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Agent not found',
        })
      );
    });

    it('should handle database errors', async () => {
      mockContext.prisma.agent.findUnique.mockRejectedValue(new Error('Database error'));

      const caller = agentRouter.createCaller(mockContext);

      await expect(caller.getById({ id: '1' })).rejects.toThrow(TRPCError);
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      mockContext.session = { user: { id: 'user1' } };
    });

    it('should execute agent task successfully', async () => {
      const mockExecution = {
        id: 'exec1',
        agentId: 'agent1',
        userId: 'user1',
        task: 'generate_content',
        status: 'RUNNING',
      };

      const mockAgent = {
        execute: jest.fn().mockResolvedValue({
          success: true,
          data: { content: 'Generated content' },
          performance: 95,
        }),
      };

      const updatedExecution = {
        ...mockExecution,
        status: 'COMPLETED',
        result: { content: 'Generated content' },
        performance: 95,
        completedAt: new Date(),
      };

      mockContext.prisma.agentExecution.create.mockResolvedValue(mockExecution);
      mockContext.prisma.agentExecution.update.mockResolvedValue(updatedExecution);
      mockAgentManager.getAgent.mockReturnValue(mockAgent);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.execute({
        agentId: 'agent1',
        task: 'generate_content',
        payload: { topic: 'AI trends' },
      });

      expect(result).toEqual({
        execution: updatedExecution,
        result: { content: 'Generated content' },
        success: true,
      });

      expect(mockContext.prisma.agentExecution.create).toHaveBeenCalledWith({
        data: {
          agentId: 'agent1',
          campaignId: undefined,
          userId: 'user1',
          task: 'generate_content',
          payload: { topic: 'AI trends' },
          status: 'RUNNING',
        },
      });
    });

    it('should handle agent execution failure', async () => {
      const mockExecution = { id: 'exec1', status: 'RUNNING' };
      const mockAgent = {
        execute: jest.fn().mockResolvedValue({
          success: false,
          error: 'Agent execution failed',
          performance: 0,
        }),
      };

      mockContext.prisma.agentExecution.create.mockResolvedValue(mockExecution);
      mockContext.prisma.agentExecution.update.mockResolvedValue({
        ...mockExecution,
        status: 'FAILED',
        error: 'Agent execution failed',
      });
      mockAgentManager.getAgent.mockReturnValue(mockAgent);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.execute({
        agentId: 'agent1',
        task: 'generate_content',
      });

      expect(result.success).toBe(false);
      expect(mockContext.prisma.agentExecution.update).toHaveBeenCalledWith({
        where: { id: 'exec1' },
        data: expect.objectContaining({
          status: 'FAILED',
          error: 'Agent execution failed',
        }),
      });
    });

    it('should throw NOT_FOUND when agent does not exist', async () => {
      mockContext.prisma.agentExecution.create.mockResolvedValue({ id: 'exec1' });
      mockAgentManager.getAgent.mockReturnValue(null);

      const caller = agentRouter.createCaller(mockContext);

      await expect(caller.execute({
        agentId: 'nonexistent',
        task: 'test',
      })).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Agent not found',
        })
      );
    });
  });

  describe('getExecutions', () => {
    beforeEach(() => {
      mockContext.session = { user: { id: 'user1' } };
    });

    it('should return paginated executions', async () => {
      const mockExecutions = [
        { id: 'exec1', agentId: 'agent1', status: 'COMPLETED', agent: {}, campaign: {} },
        { id: 'exec2', agentId: 'agent1', status: 'RUNNING', agent: {}, campaign: {} },
      ];

      mockContext.prisma.agentExecution.findMany.mockResolvedValue(mockExecutions);
      mockContext.prisma.agentExecution.count.mockResolvedValue(50);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.getExecutions({
        agentId: 'agent1',
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual({
        executions: mockExecutions,
        total: 50,
        hasMore: true,
      });
    });

    it('should filter by campaign when provided', async () => {
      mockContext.prisma.agentExecution.findMany.mockResolvedValue([]);
      mockContext.prisma.agentExecution.count.mockResolvedValue(0);

      const caller = agentRouter.createCaller(mockContext);
      await caller.getExecutions({
        campaignId: 'campaign1',
        limit: 10,
        offset: 0,
      });

      expect(mockContext.prisma.agentExecution.findMany).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaign1',
          userId: 'user1',
        },
        include: {
          agent: true,
          campaign: true,
        },
        orderBy: { startedAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('getMetrics', () => {
    beforeEach(() => {
      mockContext.session = { user: { id: 'user1' } };
    });

    it('should calculate agent performance metrics', async () => {
      const mockExecutions = [
        {
          status: 'COMPLETED',
          performance: 95,
          startedAt: new Date('2024-01-01T10:00:00Z'),
          completedAt: new Date('2024-01-01T10:05:00Z'),
        },
        {
          status: 'COMPLETED',
          performance: 85,
          startedAt: new Date('2024-01-01T11:00:00Z'),
          completedAt: new Date('2024-01-01T11:03:00Z'),
        },
        {
          status: 'FAILED',
          performance: null,
          startedAt: new Date('2024-01-01T12:00:00Z'),
          completedAt: null,
        },
      ];

      mockContext.prisma.agentExecution.findMany.mockResolvedValue(mockExecutions);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.getMetrics({
        agentId: 'agent1',
        timeRange: '30d',
      });

      expect(result).toEqual({
        totalExecutions: 3,
        successfulExecutions: 2,
        failedExecutions: 1,
        successRate: 66.66666666666666,
        avgPerformance: 60, // (95 + 85 + 0) / 3
        avgExecutionTime: expect.any(Number),
      });
    });

    it('should handle empty execution history', async () => {
      mockContext.prisma.agentExecution.findMany.mockResolvedValue([]);

      const caller = agentRouter.createCaller(mockContext);
      const result = await caller.getMetrics({
        agentId: 'agent1',
        timeRange: '7d',
      });

      expect(result).toEqual({
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0,
        avgPerformance: 0,
        avgExecutionTime: 0,
      });
    });
  });
});