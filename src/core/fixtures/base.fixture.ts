import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { PageManager } from '../../pages/manager/page.manager';

type Session = { context: BrowserContext; page: Page; pages: PageManager; close: () => Promise<void> };
type Fixtures = { createSession: () => Promise<Session> };

export const test = base.extend<Fixtures>({
  createSession: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];
    try {
      await use(async () => {
        const context = await browser.newContext();
        contexts.push(context);
        const page = await context.newPage();
        return {
          context,
          page,
          pages: new PageManager(page),
          close: async () => {
            const index = contexts.indexOf(context);
            if (index >= 0) contexts.splice(index, 1);
            await context.close();
          },
        };
      });
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  },
});

export { expect };
