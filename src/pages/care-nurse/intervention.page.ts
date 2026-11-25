import { expect, type Locator, type Page } from '@playwright/test';
import type { EscalationScenario } from '../../test-data/escalation.data';
import { interventionDateTimes } from '../../utilities/date-time.util';

type InterventionData = EscalationScenario['intervention'];

export class InterventionPage {
  readonly dialog: Locator;
  constructor(private readonly page: Page) { this.dialog = page.getByRole('dialog', { name: 'Document intervention' }); }
  async completeAndResolve(data: InterventionData): Promise<void> {
    await this.page.locator('.detail-panel').getByRole('button', { name: 'Document intervention' }).click();
    await expect(this.dialog).toBeVisible();
    const dates = interventionDateTimes();
    const disposition = this.dialog.getByRole('combobox', { name: 'Disposition', exact: true });
    await this.dialog.getByLabel('Contact date and time').fill(dates.contactDateTime);
    await this.dialog.getByLabel('Duration (minutes)').fill(data.durationMinutes);
    await this.dialog.getByLabel('Contact method').selectOption({ label: data.contactMethod });
    await this.dialog.getByLabel('Person spoken to').fill(data.personSpokenTo);
    await this.dialog.getByLabel('Clinical note').fill(data.clinicalNote);
    await this.dialog.getByLabel(/Spoke with patient by phone/i).check();
    await this.dialog.getByLabel(/Follow-up visit booked/i).check();
    await disposition.selectOption({ label: data.disposition });
    await this.dialog.getByLabel('Next navigator check-in').fill(dates.nextCheckIn);
    await this.dialog.getByLabel('Disposition notes').fill(data.dispositionNotes);

    await expect(this.dialog.getByLabel('Contact date and time')).toHaveValue(dates.contactDateTime);
    await expect(this.dialog.getByLabel('Duration (minutes)')).toHaveValue(data.durationMinutes);
    await expect(this.dialog.getByLabel('Contact method')).toHaveValue(/.*/);
    await expect(this.dialog.getByLabel('Person spoken to')).toHaveValue(data.personSpokenTo);
    await expect(this.dialog.getByLabel('Clinical note')).toHaveValue(data.clinicalNote);
    await expect(this.dialog.getByLabel(/Spoke with patient by phone/i)).toBeChecked();
    await expect(this.dialog.getByLabel(/Follow-up visit booked/i)).toBeChecked();
    const completedActions = [
      /Spoke with patient by phone/i,
      /Consulted provider/i,
      /Medication reconciliation reviewed/i,
      /Patient education given/i,
      /Referred to pharmacist/i,
      /Referred to social worker/i,
      /Follow-up visit booked/i,
    ];
    for (const action of completedActions.slice(1, -1)) await expect(this.dialog.getByLabel(action)).not.toBeChecked();
    await expect(this.dialog.getByLabel('Contact method').locator('option:checked')).toHaveText(data.contactMethod);
    await expect(disposition.locator('option:checked')).toHaveText(data.disposition);
    await expect(this.dialog.getByLabel('Next navigator check-in')).toHaveValue(dates.nextCheckIn);
    await expect(this.dialog.getByLabel('Disposition notes')).toHaveValue(data.dispositionNotes);
    await this.dialog.getByRole('button', { name: 'Sign and resolve' }).click();
    await expect(this.dialog).toBeHidden();
  }
}
