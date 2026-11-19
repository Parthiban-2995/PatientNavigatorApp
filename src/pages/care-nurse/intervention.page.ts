import { expect, type Locator, type Page } from '@playwright/test';
import { interventionDateTimes } from '../../utilities/date-time.util';
import { escalation } from '../../constants/escalation.constants';

export class InterventionPage {
  readonly dialog: Locator;
  constructor(private readonly page: Page) { this.dialog = page.getByRole('dialog', { name: 'Document intervention' }); }
  async completeAndResolve(): Promise<void> {
    await this.page.locator('.detail-panel').getByRole('button', { name: 'Document intervention' }).click();
    await expect(this.dialog).toBeVisible();
    const dates = interventionDateTimes();
    const disposition = this.dialog.getByRole('combobox', { name: 'Disposition', exact: true });
    await this.dialog.getByLabel('Contact date and time').fill(dates.contactDateTime);
    await this.dialog.getByLabel('Duration (minutes)').fill('15');
    await this.dialog.getByLabel('Contact method').selectOption({ label: 'PHONE' });
    await this.dialog.getByLabel('Person spoken to').fill('Patient');
    await this.dialog.getByLabel('Clinical note').fill(escalation.clinicalNote);
    await this.dialog.getByLabel(/Spoke with patient by phone/i).check();
    await this.dialog.getByLabel(/Follow-up visit booked/i).check();
    await disposition.selectOption({ label: 'FOLLOW UP SCHEDULED' });
    await this.dialog.getByLabel('Next navigator check-in').fill(dates.nextCheckIn);
    await this.dialog.getByLabel('Disposition notes').fill(escalation.dispositionNotes);

    await expect(this.dialog.getByLabel('Contact date and time')).toHaveValue(dates.contactDateTime);
    await expect(this.dialog.getByLabel('Duration (minutes)')).toHaveValue('15');
    await expect(this.dialog.getByLabel('Contact method')).toHaveValue(/.*/);
    await expect(this.dialog.getByLabel('Person spoken to')).toHaveValue('Patient');
    await expect(this.dialog.getByLabel('Clinical note')).toHaveValue(escalation.clinicalNote);
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
    await expect(this.dialog.getByLabel('Contact method').locator('option:checked')).toHaveText('PHONE');
    await expect(disposition.locator('option:checked')).toHaveText('FOLLOW UP SCHEDULED');
    await expect(this.dialog.getByLabel('Next navigator check-in')).toHaveValue(dates.nextCheckIn);
    await expect(this.dialog.getByLabel('Disposition notes')).toHaveValue(escalation.dispositionNotes);
    await this.dialog.getByRole('button', { name: 'Sign and resolve' }).click();
    await expect(this.dialog).toBeHidden();
  }
}
