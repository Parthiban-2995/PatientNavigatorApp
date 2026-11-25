import { test } from '../../src/core/fixtures/base.fixture';
import { createAppointmentScenario } from '../../src/test-data/appointment.data';
import { careNurseUser, patientUser } from '../../src/users/user.config';

test('Patient books an appointment and care nurse confirms it', async ({ createAuthenticatedSession }) => {
  test.slow();
  test.skip(!patientUser.password || !careNurseUser.password, 'Set PATIENT_PASSWORD and CARE_NURSE_PASSWORD in .env to run appointment confirmation flow.');

  const scenario = createAppointmentScenario();
  const patientSession = await createAuthenticatedSession(patientUser);
  const patientPages = patientSession.pages;

  await test.step('Patient books a routine in-person appointment for today', async () => {
    await patientPages.appointments.navigateToAppointments(patientUser);
    await patientPages.appointments.bookRoutineAppointment(scenario.reason);
    await patientPages.appointments.verifyUpcomingAppointment(scenario.reason, /requested/i);
  });

  await test.step('Care nurse confirms the patient appointment request', async () => {
    const nurseSession = await createAuthenticatedSession(careNurseUser);
    const nurseAppointments = nurseSession.pages.appointments;
    await nurseAppointments.navigateToAppointments(careNurseUser);
    await nurseAppointments.openNewRequests();
    await nurseAppointments.verifyAppointmentRequest(scenario.reason);
    await nurseAppointments.confirmAppointment(patientUser.name, scenario.reason);
    await nurseAppointments.openUpcomingEvents();
    await nurseAppointments.verifyUpcomingAppointment(scenario.reason, /confirmed/i);
  });

  await test.step('Patient verifies the appointment is confirmed', async () => {
    await patientSession.page.reload();
    await patientPages.appointments.verifyUpcomingAppointment(scenario.reason, /confirmed/i);
  });
});
