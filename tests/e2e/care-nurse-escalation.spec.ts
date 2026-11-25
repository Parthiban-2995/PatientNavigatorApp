import { test } from '../../src/core/fixtures/base.fixture';
import { createEscalationScenario } from '../../src/test-data/escalation.data';
import { patientUser, careNurseUser } from '../../src/users/user.config';

test('Care Nurse Escalation Handling Flow', async ({ createAuthenticatedSession }) => {
  test.slow();
  test.skip(!patientUser.password || !careNurseUser.password, 'Set PATIENT_PASSWORD and CARE_NURSE_PASSWORD in .env to run ESC-001.');
  const scenario = createEscalationScenario();

  const runStep = async (name: string, action: () => Promise<void>) => {
    await test.step(name, action);
  };

  const patientSession = await createAuthenticatedSession(patientUser);
  const patientPages = patientSession.pages;
  await runStep('France571 logs in and creates the escalation', async () => {
    const dashboard = patientPages.patientDashboard;
    await dashboard.verifyDashboardLoaded();
    await dashboard.enterChatMessage(scenario.patientMessage);
    await dashboard.sendChatMessage(scenario.patientMessage);
    await dashboard.verifyPatientMessage(scenario.patientMessage);
    await dashboard.verifyAssistantResponse(scenario.patientMessage, scenario.assistantResponse);
    await dashboard.verifyChatInputDisabled();
  });

  await runStep('Michael Chen logs in and opens the matching Active escalation', async () => {
    const nurseSession = await createAuthenticatedSession(careNurseUser);
    const nursePages = nurseSession.pages;

    const queue = nursePages.escalationQueue;
    await queue.verifyNurseLoggedIn(careNurseUser.name);
    await queue.navigateToEscalationQueue();
    await queue.selectActiveQueue();
    await queue.openMatchingEscalation(patientUser.name, scenario.patientMessage, scenario.priority);

    await runStep('Verify the case is unassigned, claim it, and confirm assignment', async () => {
      await queue.claimSelectedCase(
        patientUser.name,
        careNurseUser.name,
        scenario.patientMessage,
        scenario.priority,
      );
    });

    await runStep('Send care notes and verify they are recorded', async () => {
      await queue.sendCareNote(scenario.careNote);
    });

    await runStep('Document intervention, sign, and verify resolution', async () => {
      await nursePages.intervention.completeAndResolve(scenario.intervention);
      await queue.verifyCaseResolved();
    });
  });

  await runStep('France571 refreshes and verifies the care-team message is persisted', async () => {
    await patientSession.page.reload();
    const dashboard = patientPages.patientDashboard;
    await dashboard.waitForConversationLoaded();
    await dashboard.verifyPersistedCareTeamMessage(scenario.careNote);
  });
});
