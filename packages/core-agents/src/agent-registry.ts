import { AgentFactory } from './base-agent';

// Import all agent classes
import { ContentAgent } from './agents/content-agent';
import { AdAgent } from './agents/ad-agent';
import { OutreachAgent } from './agents/outreach-agent';
import { TrendAgent } from './agents/trend-agent';
import { InsightAgent } from './agents/insight-agent';
import { DesignAgent } from './agents/design-agent';
import { EmailMarketingAgent } from './agents/email-agent';

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
  AgentFactory.registerAgent('email', EmailMarketingAgent);
  
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