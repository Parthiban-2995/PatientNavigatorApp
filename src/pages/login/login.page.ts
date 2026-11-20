import { expect, type Page } from '@playwright/test';
import { env } from '../../core/config/env.config';

export class LoginPage {
  constructor(private readonly page: Page) {}
  async navigateToLogin(): Promise<void> {
    await this.page.goto(`${env.BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('#email')).toBeVisible();
    await expect(this.page.locator('#password')).toBeVisible();
  }
  async login(username: string, password: string): Promise<void> {
    await this.page.locator('#email').fill(username);
    await this.page.locator('#password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForURL((url) => !/\/login\/?$/.test(url.pathname));
  }
  async verifyLoginError(): Promise<void> {
    await expect(this.page.getByRole('alert')).toBeVisible();
  }
}
