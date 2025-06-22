import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

// Create context interface
export interface Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
        httpStatus: error.code === 'UNAUTHORIZED' ? 401 : 
                   error.code === 'FORBIDDEN' ? 403 :
                   error.code === 'NOT_FOUND' ? 404 :
                   error.code === 'BAD_REQUEST' ? 400 : 500,
      },
    };
  },
});

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Auth middleware
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(isAuthed);

// Admin middleware
const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Admin procedure
export const adminProcedure = t.procedure.use(isAuthed).use(isAdmin);

// Common input schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;