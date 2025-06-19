import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { CampaignAgent } from '@neon/core-agents';

const campaignAgent = new CampaignAgent();

export const campaignRouter = createTRPCRouter({
  schedule: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string(), platforms: z.array(z.string()) }))
    .mutation(async ({ input }) => campaignAgent.scheduleCampaign(input)),

  evaluate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => campaignAgent.evaluateCampaignEffectiveness(input.id)),
});
