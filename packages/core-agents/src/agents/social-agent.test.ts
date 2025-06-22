import { SocialPostingAgent } from './social-agent';
import { AgentPayload } from '../base-agent';

describe('SocialPostingAgent', () => {
  let agent: SocialPostingAgent;

  beforeEach(() => {
    agent = new SocialPostingAgent();
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('social-posting-agent');
      expect(agent.name).toBe('Social Posting Agent');
      expect(agent.type).toBe('SOCIAL');
      expect(agent.capabilities).toContain('cross-platform-posting');
      expect(agent.capabilities).toContain('content-scheduling');
      expect(agent.capabilities).toContain('engagement-tracking');
    });
  });

  describe('schedulePost', () => {
    it('should schedule a post for future publishing', async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const payload: AgentPayload = {
        task: 'schedule-post',
        priority: 'medium',
        context: {
          content: 'Test post content',
          platforms: ['TWITTER', 'LINKEDIN'],
          scheduledAt: futureDate,
          hashtags: ['#test', '#neon'],
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Post scheduled successfully');
      expect(result.data.post.status).toBe('SCHEDULED');
      expect(result.data.scheduledFor).toEqual(futureDate);
      expect(result.data.platforms).toEqual(['TWITTER', 'LINKEDIN']);
    });

    it('should publish immediately if no scheduledAt is provided', async () => {
      const payload: AgentPayload = {
        task: 'schedule-post',
        priority: 'medium',
        context: {
          content: 'Immediate post content',
          platforms: ['TWITTER'],
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Post publishing completed');
      expect(result.data.results).toBeDefined();
      expect(result.data.results.length).toBe(1);
      expect(result.data.results[0].platform).toBe('TWITTER');
    });
  });

  describe('publishPost', () => {
    it('should successfully publish to multiple platforms', async () => {
      const payload: AgentPayload = {
        task: 'publish-post',
        priority: 'medium',
        context: {
          content: 'Multi-platform test content',
          platforms: ['TWITTER', 'INSTAGRAM', 'LINKEDIN'],
          hashtags: ['#multiplatform', '#social'],
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Post publishing completed');
      expect(result.data.results).toHaveLength(3);
      expect(result.data.overallSuccess).toBe(true);
      expect(result.data.publishedPlatforms).toEqual(['TWITTER', 'INSTAGRAM', 'LINKEDIN']);
      
      // Check each platform result
      result.data.results.forEach((platformResult: any) => {
        expect(platformResult.success).toBe(true);
        expect(platformResult.postId).toBeDefined();
        expect(platformResult.url).toBeDefined();
        expect(platformResult.publishedAt).toBeDefined();
      });
    });

    it('should handle single platform publishing', async () => {
      const payload: AgentPayload = {
        task: 'publish-post',
        priority: 'medium',
        context: {
          content: 'Single platform content',
          platforms: ['INSTAGRAM'],
          mediaUrls: ['https://example.com/image.jpg'],
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].platform).toBe('INSTAGRAM');
      expect(result.data.publishedPlatforms).toEqual(['INSTAGRAM']);
    });
  });

  describe('getEngagementStats', () => {
    it('should retrieve engagement stats for a post', async () => {
      const payload: AgentPayload = {
        task: 'get-engagement-stats',
        priority: 'medium',
        context: {
          postId: 'test-post-123',
          platforms: ['TWITTER', 'INSTAGRAM'],
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.postId).toBe('test-post-123');
      expect(result.data.platformStats).toBeDefined();
      expect(result.data.platformStats.TWITTER).toBeDefined();
      expect(result.data.platformStats.INSTAGRAM).toBeDefined();
      expect(result.data.aggregateStats).toBeDefined();
      expect(result.data.aggregateStats.totalEngagement).toBeGreaterThanOrEqual(0);
    });

    it('should calculate aggregate engagement stats correctly', async () => {
      const payload: AgentPayload = {
        task: 'get-engagement-stats',
        priority: 'medium',
        context: {
          postId: 'test-post-456',
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      const { aggregateStats } = result.data;
      
      expect(aggregateStats.totalLikes).toBeGreaterThanOrEqual(0);
      expect(aggregateStats.totalComments).toBeGreaterThanOrEqual(0);
      expect(aggregateStats.totalShares).toBeGreaterThanOrEqual(0);
      expect(aggregateStats.totalEngagement).toBe(
        aggregateStats.totalLikes + aggregateStats.totalComments + aggregateStats.totalShares
      );
      expect(aggregateStats.platformCount).toBeGreaterThan(0);
    });
  });

  describe('getPostStatus', () => {
    it('should return post status information', async () => {
      const payload: AgentPayload = {
        task: 'get-post-status',
        priority: 'medium',
        context: {
          postId: 'status-test-789',
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.postId).toBe('status-test-789');
      expect(result.data.status).toBeDefined();
      expect(result.data.platforms).toBeDefined();
      expect(Array.isArray(result.data.platforms)).toBe(true);
    });
  });

  describe('cancelScheduledPost', () => {
    it('should cancel a scheduled post', async () => {
      const payload: AgentPayload = {
        task: 'cancel-scheduled-post',
        priority: 'medium',
        context: {
          postId: 'scheduled-post-999',
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Scheduled post cancelled successfully');
      expect(result.data.postId).toBe('scheduled-post-999');
      expect(result.data.cancelledAt).toBeDefined();
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const payload: AgentPayload = {
        task: 'update-post',
        priority: 'medium',
        context: {
          postId: 'update-test-111',
          updates: {
            content: 'Updated content',
            hashtags: ['#updated', '#content'],
          },
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Post updated successfully');
      expect(result.data.postId).toBe('update-test-111');
      expect(result.data.updates).toBeDefined();
      expect(result.data.updatedAt).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle invalid task names', async () => {
      const payload: AgentPayload = {
        task: 'invalid-task',
        priority: 'medium',
        context: {},
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown task: invalid-task');
    });

    it('should handle invalid payload data', async () => {
      const payload: AgentPayload = {
        task: 'publish-post',
        priority: 'medium',
        context: {
          // Missing required fields
          platforms: [],
        },
      };

      const result = await agent.execute(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('payload validation', () => {
    it('should validate correct payloads', () => {
      const validPayload: AgentPayload = {
        task: 'publish-post',
        context: { content: 'test', platforms: ['TWITTER'] },
        priority: 'medium',
      };

      expect(agent.validatePayload(validPayload)).toBe(true);
    });

    it('should reject invalid payloads', () => {
      const invalidPayload = {
        // Missing required 'task' field
        context: { content: 'test' },
        priority: 'medium',
      } as unknown as AgentPayload;

      expect(agent.validatePayload(invalidPayload)).toBe(false);
    });
  });

  describe('agent status', () => {
    it('should return current agent status', async () => {
      const status = await agent.getStatus();

      expect(status.id).toBe('social-posting-agent');
      expect(status.name).toBe('Social Posting Agent');
      expect(status.type).toBe('SOCIAL');
      expect(status.status).toBe('idle');
      expect(status.capabilities).toContain('cross-platform-posting');
    });
  });
});