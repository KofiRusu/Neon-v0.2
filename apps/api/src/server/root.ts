import { createTRPCRouter } from './trpc';
import { socialRouter } from './routers/social';

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  social: socialRouter,
  // Add other routers here as they're created
  // agent: agentRouter,
  // campaign: campaignRouter,
  // user: userRouter,
  // metrics: metricsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;