import { AgentFactory } from './base-agent';

// Import all agent classes
import { ContentAgent } from './agents/content-agent';
import { AdAgent } from './agents/ad-agent';
import { OutreachAgent } from './agents/outreach-agent';
import { TrendAgent } from './agents/trend-agent';
import { InsightAgent } from './agents/insight-agent';
import { DesignAgent } from './agents/design-agent';
import { SocialPostingAgent } from './agents/social-agent';
import { BaseAgent } from './base-agent';

interface AgentInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  agentClass: new (id: string, name: string, ...args: any[]) => BaseAgent;
}

export class AgentRegistry {
  private static agents: Map<string, AgentInfo> = new Map();

  static {
    // Register all available agents
    this.registerAgent({
      id: 'content-agent',
      name: 'Content Agent',
      type: 'CONTENT',
      description: 'AI-powered content generation for social media posts, captions, and emails',
      capabilities: ['generate_posts', 'create_captions', 'write_emails', 'optimize_content', 'a_b_test_content'],
      agentClass: ContentAgent,
    });

    this.registerAgent({
      id: 'ad-agent',
      name: 'Ad Agent',
      type: 'AD',
      description: 'Automated ad creation and optimization across platforms',
      capabilities: ['create_ads', 'optimize_campaigns', 'analyze_performance', 'budget_management'],
      agentClass: AdAgent,
    });

    this.registerAgent({
      id: 'outreach-agent',
      name: 'Outreach Agent',
      type: 'OUTREACH',
      description: 'Lead generation and personalized outreach automation',
      capabilities: ['find_leads', 'send_emails', 'follow_up', 'track_responses'],
      agentClass: OutreachAgent,
    });

    this.registerAgent({
      id: 'trend-agent',
      name: 'Trend Agent',
      type: 'TREND',
      description: 'Market trend analysis and opportunity identification',
      capabilities: ['analyze_trends', 'track_keywords', 'identify_opportunities'],
      agentClass: TrendAgent,
    });

    this.registerAgent({
      id: 'insight-agent',
      name: 'Insight Agent',
      type: 'INSIGHT',
      description: 'Performance analytics and actionable insights',
      capabilities: ['analyze_performance', 'generate_reports', 'track_metrics'],
      agentClass: InsightAgent,
    });

    this.registerAgent({
      id: 'design-agent',
      name: 'Design Agent',
      type: 'DESIGN',
      description: 'Automated visual content creation and design optimization',
      capabilities: ['create_visuals', 'optimize_designs', 'generate_templates'],
      agentClass: DesignAgent,
    });

    this.registerAgent({
      id: 'social-posting-agent',
      name: 'Social Posting Agent',
      type: 'SOCIAL',
      description: 'Cross-platform social media posting and engagement tracking',
      capabilities: ['cross-platform-posting', 'content-scheduling', 'engagement-tracking', 'multi-platform-management', 'post-optimization', 'analytics-reporting'],
      agentClass: SocialPostingAgent,
    });
  }

  static registerAgent(agentInfo: AgentInfo): void {
    this.agents.set(agentInfo.id, agentInfo);
  }

  static getAgent(id: string): AgentInfo | undefined {
    return this.agents.get(id);
  }

  static getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  static getAgentsByType(type: string): AgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  static getAgentsByCapability(capability: string): AgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.capabilities.includes(capability)
    );
  }

  static createAgent(id: string, instanceName?: string, ...args: any[]): BaseAgent {
    const agentInfo = this.getAgent(id);
    if (!agentInfo) {
      throw new Error(`Unknown agent type: ${id}`);
    }
    
    const name = instanceName || agentInfo.name;
    return new agentInfo.agentClass(id, name, ...args);
  }

  static getAvailableTypes(): string[] {
    return Array.from(new Set(this.getAllAgents().map(agent => agent.type)));
  }

  static searchAgents(query: string): AgentInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllAgents().filter(agent => 
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery) ||
      agent.capabilities.some(cap => cap.toLowerCase().includes(lowerQuery))
    );
  }
}

export default AgentRegistry;

/**
 * Register all available agents with the AgentFactory
 * This function should be called during application startup
 */
export function registerAllAgents(): void {
  // Register each agent type with the factory
  AgentFactory.registerAgent('content', ContentAgent);
  AgentFactory.registerAgent('ad', AdAgent);
  AgentFactory.registerAgent('outreach', OutreachAgent);
  AgentFactory.registerAgent('trend', TrendAgent);
  AgentFactory.registerAgent('insight', InsightAgent);
  AgentFactory.registerAgent('design', DesignAgent);
  
  console.log('Agent registry initialized');
  console.log('Available agent types:', AgentFactory.getAvailableTypes());
}

/**
 * Get a list of all registered agent types
 */
export function getRegisteredAgentTypes(): string[] {
  return AgentFactory.getAvailableTypes();
}

/**
 * Check if an agent type is registered
 */
export function isAgentTypeRegistered(type: string): boolean {
  return AgentFactory.getAvailableTypes().includes(type);
} 