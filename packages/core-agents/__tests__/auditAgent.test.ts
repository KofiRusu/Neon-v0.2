/**
 * AuditAgent Test Suite
 */

import { AuditAgent } from '../src/auditAgent';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockOpenAI)
  };
});

// Mock Prisma
const mockPrisma = {
  qualityScore: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn()
  },
  agentPerformance: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn()
  },
  aIEventLog: {
    create: jest.fn()
  }
};

jest.mock('@neon/data-model', () => ({
  prisma: mockPrisma
}));

describe('AuditAgent', () => {
  let auditAgent: AuditAgent;

  beforeEach(() => {
    auditAgent = new AuditAgent('test-api-key');
    jest.clearAllMocks();
  });

  describe('evaluateContentOutput', () => {
    it('should evaluate content and return quality scores', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              relevance: 0.8,
              clarity: 0.9,
              grammar: 0.95,
              engagement: 0.7
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await auditAgent.evaluateContentOutput('Test content');

      expect(result).toEqual({
        relevance: 0.8,
        clarity: 0.9,
        grammar: 0.95,
        engagement: 0.7,
        overall: 0.84
      });
    });

    it('should return low scores on error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const result = await auditAgent.evaluateContentOutput('Test content');

      expect(result).toEqual({
        relevance: 0.1,
        clarity: 0.1,
        grammar: 0.1,
        engagement: 0.1,
        overall: 0.1
      });
    });
  });

  describe('detectHallucination', () => {
    it('should detect hallucinations', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              isHallucination: true,
              confidence: 0.8,
              reasons: ['Unverifiable claim']
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await auditAgent.detectHallucination('False claims');

      expect(result).toBe(true);
      expect(mockPrisma.aIEventLog.create).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const result = await auditAgent.detectHallucination('Test output');

      expect(result).toBe(false);
    });
  });

  describe('logAgentPerformance', () => {
    it('should log performance for new agent', async () => {
      mockPrisma.agentPerformance.findUnique.mockResolvedValue(null);

      await auditAgent.logAgentPerformance('NewAgent', 0.8, {
        hallucinationDetected: false
      });

      expect(mockPrisma.qualityScore.create).toHaveBeenCalled();
      expect(mockPrisma.agentPerformance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agent: 'NewAgent',
          totalOutputs: 1,
          averageScore: 0.8,
          hallucinationRate: 0.0
        })
      });
    });

    it('should update existing agent performance', async () => {
      mockPrisma.agentPerformance.findUnique.mockResolvedValue({
        agent: 'ExistingAgent',
        totalOutputs: 5,
        averageScore: 0.7,
        hallucinationRate: 0.1
      });

      await auditAgent.logAgentPerformance('ExistingAgent', 0.9, {
        hallucinationDetected: false
      });

      expect(mockPrisma.agentPerformance.update).toHaveBeenCalledWith({
        where: { agent: 'ExistingAgent' },
        data: expect.objectContaining({
          totalOutputs: 6,
          averageScore: expect.any(Number),
          hallucinationRate: expect.any(Number)
        })
      });
    });
  });

  describe('getSystemAuditStats', () => {
    it('should return system statistics', async () => {
      mockPrisma.qualityScore.count.mockResolvedValue(100);
      mockPrisma.qualityScore.aggregate
        .mockResolvedValueOnce({ _avg: { overallScore: 0.75 } })
        .mockResolvedValueOnce({ _count: { hallucinationDetected: 5 } });
      mockPrisma.agentPerformance.findMany.mockResolvedValue([
        { agent: 'Agent1' },
        { agent: 'Agent2' }
      ]);

      const result = await auditAgent.getSystemAuditStats();

      expect(result).toEqual({
        totalEvaluations: 100,
        averageSystemScore: 0.75,
        hallucinationRate: 0.05,
        topPerformingAgents: ['Agent1', 'Agent2']
      });
    });
  });
});