import { expect, type Locator } from '@playwright/test';

export async function waitUntilVisible(locator: Locator): Promise<void> { await expect(locator).toBeVisible(); }
