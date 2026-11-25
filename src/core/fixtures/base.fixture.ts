import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { AuthManager } from '../../authentication/auth.manager';
import { PageManager } from '../../pages/manager/page.manager';
import type { AppUser } from '../../users/user.types';

type Session = { context: BrowserContext; page: Page; pages: PageManager; close: () => Promise<void> };
type Fixtures = {
  createSession: () => Promise<Session>;
  createAuthenticatedSession: (user: AppUser) => Promise<Session>;
};

type SessionFactory = () => Promise<Session>;

export const test = base.extend<Fixtures>({
  createSession: async ({ browser }, use) => {
    const contexts = new Set<BrowserContext>();
    const createSession: SessionFactory = async () => {
        const context = await browser.newContext();
        contexts.add(context);
        const page = await context.newPage();
        return {
          context,
          page,
          pages: new PageManager(page),
          close: async () => {
            contexts.delete(context);
            await context.close();
          },
        };
    };

    try {
      await use(createSession);
    } finally {
      await Promise.all([...contexts].map((context) => context.close()));
    }
  },
  createAuthenticatedSession: async ({ createSession }, use) => {
    await use(async (user) => {
      const session = await createSession();
      await new AuthManager(session.pages.login).login(user);
      return session;
    });
  },
});

export { expect };
