import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { z } from 'zod';

// Note: In a real implementation, this would import from your data-model package
// For now, we'll create a mock db object
const db = {
  // Mock database - replace with actual Prisma client
};

// Create context for tRPC
export const createTRPCContext = async (opts: CreateExpressContextOptions) => {
  const { req, res } = opts;
  
  // Mock session - in real app, this would come from your auth system
  const getSession = () => {
    // This would integrate with your actual auth system
    const authHeader = req.headers.authorization;
    if (authHeader) {
      return {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Test User',
          role: 'ADMIN' as 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER'
        }
      };
    }
    return null;
  };

  return {
    db,
    session: getSession(),
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Admin procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});