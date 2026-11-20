import { expect, type Locator, type Page } from '@playwright/test';
import { escalation } from '../../constants/escalation.constants';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exactText = (value: string, flags = '') => new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`, flags);

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
  async findPatientEscalation(patientName: string): Promise<void> {
    const patientNamePattern = exactText(patientName);
    const patientMessagePattern = exactText(escalation.patientMessage, 'i');
    const priorityPattern = exactText(escalation.priority);
    const candidateRows = this.rows
      .filter({ has: this.page.locator('strong', { hasText: patientNamePattern }) })
      .filter({ has: this.page.locator('span:not(.priority)', { hasText: patientMessagePattern }) })
      .filter({ has: this.page.locator('span.priority', { hasText: priorityPattern }) })
      .filter({ has: this.page.locator('small', { hasText: /^OPEN\s*·/ }) });

    await expect(candidateRows.first()).toBeVisible();
    const displayedTimestamps = await candidateRows.locator('small').allTextContents();
    let selectedIndex = -1;
    let latestTimestamp = Number.NEGATIVE_INFINITY;

    displayedTimestamps.forEach((statusText, index) => {
      const timestamp = Date.parse(statusText.split('·').at(-1)?.trim() ?? '');
      if (!Number.isNaN(timestamp) && timestamp >= latestTimestamp) {
        selectedIndex = index;
        latestTimestamp = timestamp;
      }
    });

    if (selectedIndex < 0) {
      throw new Error(`No timestamped OPEN escalation found for ${patientName}.`);
    }

    this.selectedRow = candidateRows.nth(selectedIndex);
    await expect(this.selectedRow).toBeVisible();
    await expect(this.selectedRow.locator('strong')).toHaveText(patientNamePattern);
    await expect(this.selectedRow.locator('span:not(.priority)')).toHaveText(patientMessagePattern);
    await expect(this.selectedRow.locator('span.priority')).toHaveText(priorityPattern);
  }
  async openEscalation(): Promise<void> {
    if (!this.selectedRow) throw new Error('No matching patient escalation was selected before opening the case.');
    await this.selectedRow.click();
    await expect(this.detailPanel).toBeVisible();
  }
  async claimSelectedCase(patientName: string, nurseName: string): Promise<void> {
    await expect(this.detailPanel).toContainText(patientName);
    await expect(this.detailPanel).toContainText(new RegExp(escapeRegExp(escalation.patientMessage), 'i'));
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
