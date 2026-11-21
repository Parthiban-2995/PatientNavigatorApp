import { test } from '../../src/core/fixtures/base.fixture';
import { escalation } from '../../src/constants/escalation.constants';
import { AuthManager } from '../../src/authentication/auth.manager';
import { patientUser, careNurseUser } from '../../src/users/user.config';

test('Care Nurse Escalation Handling Flow', async ({ createSession }) => {
  test.slow();
  test.skip(!patientUser.password || !careNurseUser.password, 'Set PATIENT_PASSWORD and CARE_NURSE_PASSWORD in .env to run ESC-001.');

  const runStep = async (name: string, action: () => Promise<void>) => {
    await test.step(name, action);
  };

  const session = await createSession();
  const pages = session.pages;
  await runStep('France571 logs in and creates the escalation', async () => {
    await new AuthManager(pages.login).login(patientUser);

    const dashboard = pages.patientDashboard;
    await dashboard.verifyDashboardLoaded();
    await dashboard.enterChatMessage(escalation.patientMessage);
    await dashboard.sendChatMessage(escalation.patientMessage);
    await dashboard.verifyPatientMessage(escalation.patientMessage);
    await dashboard.verifyAssistantResponse(escalation.assistantResponse);
    await dashboard.verifyChatInputDisabled();
  });

  await runStep('France571 logs out from the profile menu', async () => {
    await pages.patientDashboard.logout();
  });

  await runStep('Michael Chen logs in and opens the matching Active escalation', async () => {
    await new AuthManager(pages.login).login(careNurseUser);

    const queue = pages.escalationQueue;
    await queue.verifyNurseLoggedIn(careNurseUser.name);
    await queue.navigateToEscalationQueue();
    await queue.selectActiveQueue();
    await queue.findPatientEscalation(patientUser.name);
    await queue.openEscalation();
  });

  await runStep('Verify the case is unassigned, claim it, and confirm assignment', async () => {
    await pages.escalationQueue.claimSelectedCase(patientUser.name, careNurseUser.name);
  });

  await runStep('Send care notes and verify they are recorded', async () => {
    await pages.escalationQueue.sendCareNote(escalation.careNote);
  });

  await runStep('Document intervention, sign, and verify resolution', async () => {
    await pages.intervention.completeAndResolve();
    await pages.escalationQueue.verifyCaseResolved();
  });

  await runStep('France571 logs back in and verifies the care-team message is persisted', async () => {
    await pages.patientDashboard.logout();
    await new AuthManager(pages.login).login(patientUser);

    const dashboard = pages.patientDashboard;
    await dashboard.waitForConversationLoaded();
    await dashboard.verifyPersistedCareTeamMessage(escalation.careNote);
  });
});
