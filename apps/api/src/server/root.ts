import { router } from './trpc';
import { supportRouter } from './routers/support';

export const appRouter = router({
  support: supportRouter,
});

export type AppRouter = typeof appRouter;