import type { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}
  async waitForDomContent(): Promise<void> { await this.page.waitForLoadState('domcontentloaded'); }
}
