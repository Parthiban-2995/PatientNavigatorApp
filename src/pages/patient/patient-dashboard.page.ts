import { expect, type Locator, type Page } from '@playwright/test';

export class PatientDashboardPage {
  private readonly chatInput: Locator;
  private readonly patientBubble: Locator;
  private currentPatientBubble?: Locator;

  constructor(private readonly page: Page) {
    this.chatInput = page.locator('#patient-message');
    this.patientBubble = page.locator('.ai-chat__message--patient .ai-chat__bubble');
  }
  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Health Navigator', exact: true })).toBeVisible();
    await expect(this.chatInput).toBeVisible();
  }
  async enterChatMessage(message: string): Promise<void> {
    await expect(this.chatInput).toBeVisible();
    await this.chatInput.fill(message);
  }
  async sendChatMessage(message: string): Promise<void> {
    const previousBubbleCount = await this.patientBubble.count();
    await this.chatInput.locator('..').getByRole('button', { name: 'Send' }).click();
    await expect(this.chatInput).toHaveValue('', { timeout: 30_000 });
    await expect(this.patientBubble).toHaveCount(previousBubbleCount + 1, { timeout: 30_000 });
    this.currentPatientBubble = this.patientBubble.last();
    await expect(this.currentPatientBubble).toHaveText(message);
  }
  async verifyPatientMessage(message: string): Promise<void> {
    if (!this.currentPatientBubble) throw new Error('Send a patient message before verifying it.');
    await expect(this.currentPatientBubble).toHaveText(message, { timeout: 30_000 });
  }
  async verifyAssistantResponse(message: string): Promise<void> {
    if (!this.currentPatientBubble) throw new Error('Send a patient message before verifying its assistant response.');
    const patientArticle = this.currentPatientBubble.locator('xpath=ancestor::article[1]');
    const responseArticle = patientArticle.locator('xpath=following-sibling::article[1]');
    await expect(responseArticle).toBeVisible({ timeout: 60_000 });
    await expect(responseArticle.locator('.ai-chat__bubble')).toHaveText(message, { timeout: 60_000 });
  }

  async verifyChatInputDisabled(): Promise<void> {
    await expect(this.chatInput).toBeDisabled();
  }

  async logout(): Promise<void> {
    const profile = this.page.locator('.sidebar-user');
    await expect(profile).toBeVisible();
    await profile.click();

    const logoutControl = this.page.getByRole('button', { name: /log\s*out|logout|sign\s*out/i })
      .or(this.page.getByRole('link', { name: /log\s*out|logout|sign\s*out/i }))
      .or(this.page.getByRole('menuitem', { name: /log\s*out|logout|sign\s*out/i }))
      .or(this.page.getByText(/^(log\s*out|logout|sign\s*out)$/i));
    await expect(logoutControl.first()).toBeVisible({ timeout: 30_000 });
    await logoutControl.first().click();
    await expect(this.page.locator('#email')).toBeVisible({ timeout: 60_000 });
  }
}
