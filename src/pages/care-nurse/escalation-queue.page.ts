import { expect, type Locator, type Page } from '@playwright/test';
import { escalation } from '../../constants/escalation.constants';

export class EscalationQueuePage {
  private readonly rows: Locator;
  private readonly detailPanel: Locator;
  private selectedRow?: Locator;
  constructor(private readonly page: Page) {
    this.rows = page.getByRole('region', { name: 'Escalations' }).locator('button.case-row');
    this.detailPanel = page.locator('.detail-panel');
  }
  async navigateToEscalationQueue(): Promise<void> {
    await this.page.getByRole('link', { name: 'Escalation queue' }).click();
    await expect(this.page).toHaveURL(/\/transitional-care-nurse\/escalation-queue(?:$|\?)/);
    await expect(this.page.getByRole('region', { name: 'Escalations' })).toBeVisible();
  }
  async selectActiveQueue(): Promise<void> { await this.page.getByRole('button', { name: 'Active', exact: true }).click(); }
  async verifyNurseLoggedIn(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }
  async waitForQueueLoaded(): Promise<void> {
    const panel = this.page.getByRole('region', { name: 'Escalations' });
    await expect(panel).toBeVisible({ timeout: 60_000 });
    await expect(this.rows.first()).toBeVisible({ timeout: 60_000 });
    let previousCount = -1;
    let stableSamples = 0;
    await expect.poll(async () => {
      const count = await this.rows.count();
      stableSamples = count === previousCount ? stableSamples + 1 : 0;
      previousCount = count;
      return stableSamples;
    }, { timeout: 60_000, message: 'Waiting for the escalation queue row count to settle after the list appears.' }).toBeGreaterThanOrEqual(4);
  }
  async findPatientEscalation(patientName: string): Promise<void> {
    const candidateRows = this.rows
      .filter({ hasText: patientName })
      .filter({ hasText: escalation.patientMessage });
    await expect.poll(async () => candidateRows.count(), {
      timeout: 60_000,
      message: `Waiting for ${patientName}'s queue record with message: ${escalation.patientMessage}`,
    }).toBeGreaterThan(0);
    this.selectedRow = candidateRows.first();
    await expect(this.selectedRow).toContainText(escalation.patientMessage);
    await expect(this.selectedRow).toContainText(patientName);
  }
  async openEscalation(): Promise<void> {
    if (!this.selectedRow) throw new Error('No matching patient escalation was selected before opening the case.');
    await this.selectedRow.click();
    await expect(this.detailPanel).toBeVisible();
  }
  async claimSelectedCase(patientName: string, nurseName: string): Promise<void> {
    await expect(this.detailPanel).toContainText(patientName);
    await expect(this.detailPanel).toContainText(escalation.patientMessage);
    await expect(this.detailPanel).toContainText(escalation.priority);
    const assignedTo = this.detailPanel.locator('dt').filter({ hasText: /^Assigned to$/ }).locator('xpath=following-sibling::dd[1]');
    await expect(assignedTo).toHaveText('Unassigned');
    await this.detailPanel.getByRole('button', { name: /Claim case/i }).click();
    await expect(assignedTo).toHaveText(nurseName);
    await expect(this.detailPanel).toContainText(/IN PROGRESS/);
    await expect(this.detailPanel.getByRole('button', { name: /Claim case/i })).toHaveCount(0);
  }
  async sendCareNote(note: string): Promise<void> {
    await this.detailPanel.locator('#action-notes').fill(note);
    await this.detailPanel.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(this.detailPanel.getByText(note, { exact: true })).toBeVisible();
  }
  async verifyCaseResolved(): Promise<void> {
    await expect(this.detailPanel.locator('header .status')).toHaveText('RESOLVED');
  }
}
