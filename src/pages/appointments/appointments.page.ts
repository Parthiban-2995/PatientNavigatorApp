import { expect, type Locator, type Page } from '@playwright/test';
import type { AppUser } from '../../users/user.types';

export class AppointmentsPage {
  private readonly upcomingSection: Locator;

  constructor(private readonly page: Page) {
    this.upcomingSection = page.getByRole('region', { name: /upcoming appointments/i })
      .or(page.locator('section.appointments-section').filter({ hasText: /upcoming appointments/i }));
  }

  async navigateToAppointments(user: AppUser): Promise<void> {
    await this.page.getByRole('link', { name: 'Appointments', exact: true }).click();
    const path = user.role === 'Patient' ? /\/patient\/appointments(?:$|\?)/ : /\/transitional-care-nurse\/appointments(?:$|\?)/;
    await expect(this.page).toHaveURL(path);
    if (user.role === 'Patient') await expect(this.upcomingSection).toBeVisible();
  }

  async bookRoutineAppointment(reason: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Book appointment', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Book an appointment' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox', { name: 'Appointment type', exact: true }).selectOption('ROUTINE');
    await dialog.locator('input[name="appointment_date"]').fill(this.getTomorrow());
    await dialog.getByRole('combobox', { name: 'Duration', exact: true }).selectOption({ label: '30 minutes' });
    await dialog.getByRole('combobox', { name: 'Channel', exact: true }).selectOption({ label: 'In person' });
    await dialog.locator('button.slot-option').first().click();
    await dialog.getByLabel(/Reason/).fill(reason);
    await dialog.getByRole('button', { name: 'Book appointment', exact: true }).click();
    await expect(dialog).toBeHidden();
  }

  async verifyUpcomingAppointment(reason: string, status: RegExp | string): Promise<void> {
    const row = this.appointmentRow(reason);
    await expect(row).toBeVisible();
    await expect(row).toContainText(reason);
    await expect(row).toContainText(/routine/i);
    await expect(row).toContainText(/in person/i);
    await expect(row).toContainText(status);
  }

  async verifyAppointmentRequest(reason: string): Promise<void> {
    const row = this.appointmentRow(reason);
    await expect(row).toBeVisible();
    await expect(row.locator('[data-label="Reason"]')).toHaveText(reason);
    await expect(row.locator('[data-label="Status"]')).toHaveText(/requested/i);
    await expect(row.getByRole('button', { name: /confirm/i })).toBeVisible();
  }

  async openNewRequests(): Promise<void> {
    const newRequests = this.page.getByRole('tab', { name: /new request/i })
      .or(this.page.getByRole('button', { name: /new request/i }))
      .or(this.page.getByRole('link', { name: /new request/i }));
    await expect(newRequests.first()).toBeVisible();
    await newRequests.first().click();
  }

  async confirmAppointment(patientName: string, reason: string): Promise<void> {
    const row = this.appointmentRow(reason);
    await expect(row).toContainText(patientName);
    await row.getByRole('button', { name: /confirm/i }).click();
  }

  async openUpcomingEvents(): Promise<void> {
    const upcomingEvents = this.page.getByRole('tab', { name: /my upcoming|upcoming event/i })
      .or(this.page.getByRole('button', { name: /my upcoming|upcoming event/i }))
      .or(this.page.getByRole('link', { name: /my upcoming|upcoming event/i }));
    if (await upcomingEvents.first().count()) {
      await expect(upcomingEvents.first()).toBeVisible();
      await upcomingEvents.first().click();
    }
    await expect(this.page.locator('#appointment-panel-upcoming')
      .or(this.page.getByRole('tabpanel').filter({ hasText: /my upcoming appointments/i }))).toBeVisible();
  }

  private appointmentRow(reason: string): Locator {
    return this.page.locator('table.appointments-table tbody tr').filter({
      hasText: reason,
    }).last();
  }

  private getTomorrow(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
  }
}
