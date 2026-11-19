import type { Page } from '@playwright/test';
import { EscalationQueuePage } from '../care-nurse/escalation-queue.page';
import { InterventionPage } from '../care-nurse/intervention.page';
import { LoginPage } from '../login/login.page';
import { PatientDashboardPage } from '../patient/patient-dashboard.page';

/** Page objects bound to a single Playwright page. Create one manager per page. */
export class PageManager {
  readonly login: LoginPage;
  readonly patientDashboard: PatientDashboardPage;
  readonly escalationQueue: EscalationQueuePage;
  readonly intervention: InterventionPage;

  constructor(page: Page) {
    this.login = new LoginPage(page);
    this.patientDashboard = new PatientDashboardPage(page);
    this.escalationQueue = new EscalationQueuePage(page);
    this.intervention = new InterventionPage(page);
  }
}
