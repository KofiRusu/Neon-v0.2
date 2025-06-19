/**
 * AuditAgent - System-wide AI Output Evaluation Agent
 * Performs autonomous quality audits on all other agents' outputs
 */

import OpenAI from 'openai';
import { prisma, type QualityScoreData, type AIEventLogData } from '@neon/data-model';
import type { 
  QualityScore, 
  HallucinationCheck, 
  EvaluationCriteria,
  Result
} from '@neon/types';
import { generateId, retry, safeJsonParse } from '@neon/utils';

export class AuditAgent {
  private openai: OpenAI;
  private evaluationCriteria: EvaluationCriteria;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });

    // Define evaluation criteria with weights
    this.evaluationCriteria = {
      relevance: {
        weight: 0.3,
        description: 'How relevant and on-topic the content is to the given context'
      },
      clarity: {
        weight: 0.25,
        description: 'How clear, understandable, and well-structured the content is'
      },
      grammar: {
        weight: 0.2,
        description: 'Grammatical correctness and language quality'
      },
      engagement: {
        weight: 0.25,
        description: 'How engaging and compelling the content is for the target audience'
      }
    };
  }

  /**
   * Evaluates content output and returns quality scores
   */
  async evaluateContentOutput(content: string): Promise<QualityScore> {
    try {
      const prompt = this.buildEvaluationPrompt(content);
      
      const response = await retry(async () => {
        return await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert content evaluator. Analyze the provided content and return scores as JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // Low temperature for consistent scoring
          max_tokens: 500
        });
      }, 3, 1000);

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const parsedResult = safeJsonParse<{
        relevance: number;
        clarity: number;
        grammar: number;
        engagement: number;
      }>(result);

      if (!parsedResult.success) {
        throw new Error('Failed to parse evaluation result');
      }

      const scores = parsedResult.data;
      const overall = this.calculateOverallScore(scores);

      return {
        relevance: scores.relevance,
        clarity: scores.clarity,
        grammar: scores.grammar,
        engagement: scores.engagement,
        overall
      };

    } catch (error) {
      await this.logEvent('evaluation_error', {
        error: error instanceof Error ? error.message : String(error),
        contentLength: content.length
      }, false);
      
      // Return default low scores on error
      return {
        relevance: 0.1,
        clarity: 0.1,
        grammar: 0.1,
        engagement: 0.1,
        overall: 0.1
      };
    }
  }

  /**
   * Detects potential hallucinations in the output
   */
  async detectHallucination(output: string): Promise<boolean> {
    try {
      const hallucinationCheck = await this.performHallucinationCheck(output);
      
      await this.logEvent('hallucination_check', {
        isHallucination: hallucinationCheck.isHallucination,
        confidence: hallucinationCheck.confidence,
        reasons: hallucinationCheck.reasons,
        outputLength: output.length
      });

      return hallucinationCheck.isHallucination;

    } catch (error) {
      await this.logEvent('hallucination_check_error', {
        error: error instanceof Error ? error.message : String(error),
        outputLength: output.length
      }, false);
      
      // Return false on error to avoid false positives
      return false;
    }
  }

  /**
   * Logs agent performance with scores and metadata
   */
  async logAgentPerformance(
    agent: string, 
    score: number, 
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      // Log the quality score
      const qualityScoreData: QualityScoreData = {
        agent,
        outputId: metadata.outputId || generateId(),
        relevanceScore: metadata.relevanceScore || 0,
        clarityScore: metadata.clarityScore || 0,
        grammarScore: metadata.grammarScore || 0,
        engagementScore: metadata.engagementScore || 0,
        overallScore: score,
        hallucinationDetected: metadata.hallucinationDetected || false,
        metadata
      };

      await prisma.qualityScore.create({
        data: qualityScoreData
      });

      // Update agent performance metrics
      await this.updateAgentPerformanceMetrics(agent, score, metadata.hallucinationDetected);

      // Log the performance event
      await this.logEvent('agent_performance_logged', {
        agent,
        score,
        ...metadata
      });

    } catch (error) {
      await this.logEvent('performance_logging_error', {
        agent,
        score,
        error: error instanceof Error ? error.message : String(error)
      }, false);
    }
  }

  /**
   * Builds the evaluation prompt for OpenAI
   */
  private buildEvaluationPrompt(content: string): string {
    return `
Evaluate the following content based on these criteria:

1. **Relevance** (${this.evaluationCriteria.relevance.weight * 100}%): ${this.evaluationCriteria.relevance.description}
2. **Clarity** (${this.evaluationCriteria.clarity.weight * 100}%): ${this.evaluationCriteria.clarity.description}
3. **Grammar** (${this.evaluationCriteria.grammar.weight * 100}%): ${this.evaluationCriteria.grammar.description}
4. **Engagement** (${this.evaluationCriteria.engagement.weight * 100}%): ${this.evaluationCriteria.engagement.description}

Content to evaluate:
"""
${content}
"""

Return your evaluation as a JSON object with scores from 0.0 to 1.0 for each criteria:
{
  "relevance": 0.0-1.0,
  "clarity": 0.0-1.0,
  "grammar": 0.0-1.0,
  "engagement": 0.0-1.0
}
`;
  }

  /**
   * Performs detailed hallucination detection
   */
  private async performHallucinationCheck(output: string): Promise<HallucinationCheck> {
    const prompt = `
Analyze the following text for potential hallucinations or factual inaccuracies:

Text to analyze:
"""
${output}
"""

Look for:
1. Unverifiable or potentially false claims
2. Inconsistencies within the text
3. Implausible statements or scenarios
4. References to non-existent entities, events, or data

Return your analysis as JSON:
{
  "isHallucination": boolean,
  "confidence": 0.0-1.0,
  "reasons": ["list of specific reasons if hallucination is detected"]
}
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert fact-checker and content analyst. Be thorough but conservative in flagging hallucinations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      return { isHallucination: false, confidence: 0, reasons: [] };
    }

    const parsedResult = safeJsonParse<HallucinationCheck>(result);
    if (!parsedResult.success) {
      return { isHallucination: false, confidence: 0, reasons: [] };
    }

    return parsedResult.data;
  }

  /**
   * Calculates overall score based on weighted criteria
   */
  private calculateOverallScore(scores: {
    relevance: number;
    clarity: number;
    grammar: number;
    engagement: number;
  }): number {
    const weightedSum = 
      scores.relevance * this.evaluationCriteria.relevance.weight +
      scores.clarity * this.evaluationCriteria.clarity.weight +
      scores.grammar * this.evaluationCriteria.grammar.weight +
      scores.engagement * this.evaluationCriteria.engagement.weight;

    return Math.round(weightedSum * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Updates agent performance metrics in the database
   */
  private async updateAgentPerformanceMetrics(
    agent: string, 
    score: number, 
    hallucinationDetected: boolean
  ): Promise<void> {
    // Upsert agent performance record
    const existing = await prisma.agentPerformance.findUnique({
      where: { agent }
    });

    if (existing) {
      const newTotalOutputs = existing.totalOutputs + 1;
      const newAverageScore = (existing.averageScore * existing.totalOutputs + score) / newTotalOutputs;
      const newHallucinationCount = existing.hallucinationRate * existing.totalOutputs + (hallucinationDetected ? 1 : 0);
      const newHallucinationRate = newHallucinationCount / newTotalOutputs;

      await prisma.agentPerformance.update({
        where: { agent },
        data: {
          totalOutputs: newTotalOutputs,
          averageScore: Math.round(newAverageScore * 100) / 100,
          hallucinationRate: Math.round(newHallucinationRate * 100) / 100,
          lastEvaluated: new Date()
        }
      });
    } else {
      await prisma.agentPerformance.create({
        data: {
          agent,
          totalOutputs: 1,
          averageScore: score,
          hallucinationRate: hallucinationDetected ? 1.0 : 0.0,
          lastEvaluated: new Date()
        }
      });
    }
  }

  /**
   * Logs events to AIEventLog
   */
  private async logEvent(
    event: string, 
    metadata: Record<string, any>, 
    success: boolean = true
  ): Promise<void> {
    try {
      const eventData: AIEventLogData = {
        agent: 'AuditAgent',
        event,
        metadata,
        success,
        error: success ? undefined : metadata.error
      };

      await prisma.aIEventLog.create({
        data: eventData
      });
    } catch (error) {
      // Silent failure for logging to prevent infinite loops
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Gets historical performance data for an agent
   */
  async getAgentPerformanceHistory(agent: string, limit: number = 10): Promise<any[]> {
    return await prisma.qualityScore.findMany({
      where: { agent },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  /**
   * Gets overall system audit statistics
   */
  async getSystemAuditStats(): Promise<{
    totalEvaluations: number;
    averageSystemScore: number;
    hallucinationRate: number;
    topPerformingAgents: string[];
  }> {
    const [totalEvaluations, avgScore, hallucinationStats, topAgents] = await Promise.all([
      prisma.qualityScore.count(),
      prisma.qualityScore.aggregate({
        _avg: { overallScore: true }
      }),
      prisma.qualityScore.aggregate({
        _count: { hallucinationDetected: true },
        where: { hallucinationDetected: true }
      }),
      prisma.agentPerformance.findMany({
        orderBy: { averageScore: 'desc' },
        take: 5,
        select: { agent: true }
      })
    ]);

    return {
      totalEvaluations,
      averageSystemScore: avgScore._avg.overallScore || 0,
      hallucinationRate: totalEvaluations > 0 ? (hallucinationStats._count.hallucinationDetected / totalEvaluations) : 0,
      topPerformingAgents: topAgents.map(a => a.agent)
    };
  }
}