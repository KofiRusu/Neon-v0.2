import { Logger } from '@neon/types';
import { ReplyAnalysis } from '../types/outreach-types';

export class ReplyAnalyzer {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async analyzeReply(emailContent: string): Promise<ReplyAnalysis> {
    this.logger.info('Analyzing email reply', { contentLength: emailContent.length });

    const analysis = {
      type: this.classifyReplyType(emailContent),
      sentiment: this.analyzeSentiment(emailContent),
      keywords: this.extractKeywords(emailContent),
      suggestedResponse: '',
      shouldContinueSequence: false
    };

    analysis.suggestedResponse = this.generateSuggestedResponse(analysis);
    analysis.shouldContinueSequence = this.shouldContinueSequence(analysis);

    this.logger.info('Reply analysis completed', {
      type: analysis.type,
      sentiment: analysis.sentiment,
      shouldContinue: analysis.shouldContinueSequence
    });

    return analysis;
  }

  private classifyReplyType(content: string): ReplyAnalysis['type'] {
    const lowerContent = content.toLowerCase();

    // Positive indicators
    const positiveKeywords = [
      'interested', 'yes', 'sounds good', 'let\'s talk', 'call me', 'schedule',
      'meeting', 'discuss', 'tell me more', 'sounds interesting', 'curious',
      'would love to', 'definitely', 'absolutely', 'great', 'perfect'
    ];

    // Negative indicators
    const negativeKeywords = [
      'not interested', 'no thank you', 'not a good fit', 'don\'t contact',
      'remove me', 'unsubscribe', 'stop emailing', 'not now', 'too busy',
      'not the right time', 'no budget', 'already have'
    ];

    // Neutral/info request indicators
    const infoRequestKeywords = [
      'tell me more', 'more information', 'details', 'pricing', 'how does',
      'what is', 'can you explain', 'more about', 'specifics'
    ];

    // Not interested indicators
    const notInterestedKeywords = [
      'not interested', 'no thanks', 'not right now', 'not a priority',
      'not looking', 'not in the market'
    ];

    // Check for positive responses
    if (positiveKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'positive';
    }

    // Check for information requests
    if (infoRequestKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'request_info';
    }

    // Check for not interested
    if (notInterestedKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'not_interested';
    }

    // Check for negative responses
    if (negativeKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'negative';
    }

    // Default to neutral
    return 'neutral';
  }

  private analyzeSentiment(content: string): number {
    const lowerContent = content.toLowerCase();

    // Positive sentiment words
    const positiveWords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good',
      'interested', 'excited', 'love', 'perfect', 'awesome', 'brilliant',
      'outstanding', 'impressive', 'valuable', 'helpful', 'useful'
    ];

    // Negative sentiment words
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'annoying',
      'frustrated', 'disappointed', 'angry', 'upset', 'waste',
      'useless', 'pointless', 'spam', 'irrelevant', 'inappropriate'
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) negativeCount++;
    });

    // Calculate sentiment score (-1 to 1)
    const totalWords = content.split(/\s+/).length;
    const positiveScore = positiveCount / totalWords;
    const negativeScore = negativeCount / totalWords;

    let sentiment = 0;
    if (positiveScore > negativeScore) {
      sentiment = Math.min(positiveScore * 2, 1);
    } else if (negativeScore > positiveScore) {
      sentiment = Math.max(-negativeScore * 2, -1);
    }

    return Number(sentiment.toFixed(2));
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction - in production, you'd use NLP libraries
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Common stop words to exclude
    const stopWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'know',
      'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when',
      'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over',
      'such', 'take', 'than', 'them', 'well', 'were', 'what'
    ]);

    const keywords = words
      .filter(word => !stopWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Return top keywords by frequency
    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private generateSuggestedResponse(analysis: ReplyAnalysis): string {
    switch (analysis.type) {
      case 'positive':
        return 'Thank you for your interest! I\'ll send you a calendar link to schedule a convenient time to talk.';
      
      case 'request_info':
        return 'I\'d be happy to provide more details. Let me send you some additional information about how we can help.';
      
      case 'not_interested':
        return 'I understand this isn\'t a priority right now. I\'ll keep you in mind for future opportunities that might be more relevant.';
      
      case 'negative':
        return 'I apologize if my message wasn\'t relevant. I\'ll make sure to remove you from future communications.';
      
      default:
        return 'Thank you for your response. I\'d love to continue our conversation when you have time.';
    }
  }

  private shouldContinueSequence(analysis: ReplyAnalysis): boolean {
    switch (analysis.type) {
      case 'positive':
      case 'request_info':
        return true; // Continue with different approach
      
      case 'negative':
      case 'not_interested':
        return false; // Stop the sequence
      
      case 'neutral':
        return analysis.sentiment > -0.5; // Continue if not too negative
      
      default:
        return false;
    }
  }

  async batchAnalyzeReplies(replies: Array<{ id: string; content: string }>): Promise<Array<{ id: string; analysis: ReplyAnalysis }>> {
    this.logger.info('Batch analyzing replies', { count: replies.length });

    const results = await Promise.all(
      replies.map(async (reply) => ({
        id: reply.id,
        analysis: await this.analyzeReply(reply.content)
      }))
    );

    this.logger.info('Batch reply analysis completed', { 
      processed: results.length,
      positive: results.filter(r => r.analysis.type === 'positive').length,
      negative: results.filter(r => r.analysis.type === 'negative').length
    });

    return results;
  }

  async trainModel(trainingData: Array<{ content: string; expectedType: ReplyAnalysis['type'] }>): Promise<void> {
    this.logger.info('Training reply analysis model', { dataPoints: trainingData.length });
    
    // Mock model training - in production, this would train an ML model
    // For now, just log the training data for analysis
    const typeDistribution = trainingData.reduce((acc, data) => {
      acc[data.expectedType] = (acc[data.expectedType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.logger.info('Training data distribution', typeDistribution);
  }
}