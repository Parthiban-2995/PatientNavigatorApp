import { expect, type Locator, type Page } from '@playwright/test';
import { createExactTextMatcher } from '../../utilities/text-matching.util';

export class PatientDashboardPage {
  private readonly chat: Locator;
  private readonly messages: Locator;
  private readonly conversationMessages: Locator;
  private readonly chatInput: Locator;
  private readonly patientBubble: Locator;
  private readonly careTeamBubble: Locator;

  constructor(private readonly page: Page) {
    this.chat = page.locator('app-ai-chat .ai-chat');
    this.messages = this.chat.locator('.ai-chat__messages');
    this.conversationMessages = this.messages.locator('article.ai-chat__message');
    this.chatInput = page.locator('#patient-message');
    this.patientBubble = page.locator('.ai-chat__message--patient .ai-chat__bubble');
    this.careTeamBubble = page.locator('.ai-chat__message--staff .ai-chat__bubble');
  }
  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.chat).toBeVisible();
    await expect(this.chat.getByRole('heading', { name: 'Health Navigator', exact: true })).toBeVisible();
    await expect(this.messages).toBeVisible();
    await expect(this.conversationMessages.last()).toBeVisible();
    await expect(this.chat.locator('.ai-chat__composer')).toBeVisible();
    await expect(this.chatInput).toBeVisible();
    await expect(this.chatInput).toBeEditable();
  }
  async waitForConversationLoaded(): Promise<void> {
    await this.conversationMessages.last().waitFor({ state: 'visible' });
  }
  async enterChatMessage(message: string): Promise<void> {
    await expect(this.conversationMessages.last()).toBeVisible();
    await expect(this.chatInput).toBeEditable();
    await this.chatInput.fill(message);
  }
  async sendChatMessage(message: string): Promise<void> {
    const matchingMessages = this.patientBubble.filter({ hasText: createExactTextMatcher(message) });
    const previousMatchCount = await matchingMessages.count();
    await this.chatInput.locator('..').getByRole('button', { name: 'Send' }).click();
    await expect(this.chatInput).toHaveValue('');
    await expect(matchingMessages).toHaveCount(previousMatchCount + 1);
    await expect(matchingMessages.last()).toHaveText(message);
  }
  async verifyPatientMessage(message: string): Promise<void> {
    const matchingMessages = this.patientBubble.filter({ hasText: createExactTextMatcher(message) });
    await expect(matchingMessages.last()).toHaveText(message);
  }
  async verifyPersistedPatientMessage(message: string): Promise<void> {
    const matchingMessages = this.patientBubble.filter({ hasText: message });
    await expect(matchingMessages.last()).toHaveText(message);
  }
  async verifyPersistedCareTeamMessage(message: string): Promise<void> {
    const matchingMessages = this.careTeamBubble.filter({ hasText: message });
    await expect(matchingMessages.last()).toHaveText(message);
  }
  async verifyAssistantResponse(patientMessageText: string, assistantResponseText: string): Promise<void> {
    const patientMessage = this.patientBubble
      .filter({ hasText: createExactTextMatcher(patientMessageText) })
      .last();
    const patientArticle = patientMessage.locator('xpath=ancestor::article[1]');
    const responseArticle = patientArticle.locator('xpath=following-sibling::article[1]');
    await expect(responseArticle).toBeVisible();
    await expect(responseArticle.locator('.ai-chat__bubble')).toHaveText(assistantResponseText);
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
    await expect(logoutControl.first()).toBeVisible();
    await logoutControl.first().click();
    await expect(this.page.locator('#email')).toBeVisible();
  }
}
