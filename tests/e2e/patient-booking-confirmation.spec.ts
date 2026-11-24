import { test } from '../../src/core/fixtures/base.fixture';
import { AuthManager } from '../../src/authentication/auth.manager';
import { careNurseUser, patientUser } from '../../src/users/user.config';

test('Patient books an appointment and care nurse confirms it', async ({ createSession }) => {
  test.slow();
  test.skip(!patientUser.password || !careNurseUser.password, 'Set PATIENT_PASSWORD and CARE_NURSE_PASSWORD in .env to run appointment confirmation flow.');

  const reason = `Routine follow-up test ${Date.now()}`;
  const session = await createSession();
  const pages = session.pages;

  await test.step('Patient books a routine in-person appointment for tomorrow', async () => {
    await new AuthManager(pages.login).login(patientUser);
    await pages.appointments.navigateToAppointments(patientUser);
    await pages.appointments.bookRoutineAppointment(reason);
    await pages.appointments.verifyUpcomingAppointment(reason, /requested/i);
  });

  await test.step('Care nurse confirms the patient appointment request', async () => {
    await pages.patientDashboard.logout();
    await new AuthManager(pages.login).login(careNurseUser);
    await pages.appointments.navigateToAppointments(careNurseUser);
    await pages.appointments.openNewRequests();
    await pages.appointments.verifyAppointmentRequest(reason);
    await pages.appointments.confirmAppointment(patientUser.name, reason);
    await pages.appointments.openUpcomingEvents();
    await pages.appointments.verifyUpcomingAppointment(reason, /confirmed/i);
  });

  await test.step('Patient verifies the appointment is confirmed', async () => {
    await pages.patientDashboard.logout();
    await new AuthManager(pages.login).login(patientUser);
    await pages.appointments.navigateToAppointments(patientUser);
    await pages.appointments.verifyUpcomingAppointment(reason, /confirmed/i);
  });
});
