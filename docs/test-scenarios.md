# ESC-001: Care Nurse Escalation Handling Flow

## Preconditions

- The Patient Navigator development application is available at `BASE_URL`.
- A valid patient and transitional care nurse account are configured in `.env`.
- The run has permission to create and resolve an escalation in this test environment.

## Credential references

- Patient: `PATIENT_USERNAME` and `PATIENT_PASSWORD` (France571 Gusikowski974).
- Care Nurse: `CARE_NURSE_USERNAME` and `CARE_NURSE_PASSWORD` (Michael Chen).
- Passwords are read from environment variables and are not stored in this document.

## Test data

- Patient message: `I feel dizzy`
- Expected assistant response: `This could be an emergency. Call 911 now. Do not wait for a reply here or drive yourself. If you can, ask someone nearby to stay with you.`
- Escalation card safety message: `Do not start, stop, skip, or change a medicine until a care-team member has reviewed your request.`
- Expected queue patient: `France571 Gusikowski974`
- Priority: `CRITICAL`
- Care note: `Emergency care is alerted`

## Execution and expected results

1. Create an authenticated patient browser context for France571 and verify the Patient Dashboard and Health Navigator.
2. Submit the dizziness message. Verify the exact patient bubble, the exact fresh assistant response, the safety text in the escalation card, and created status.
3. Create a separate authenticated care nurse browser context for Michael Chen and verify his identity.
4. Open the Active Escalation queue. Match the patient, message, and CRITICAL priority, then select the latest matching row by its displayed creation date and time. Fail if no parseable timestamp exists.
5. Verify the detail panel shows France571's escalation and `Assigned to: Unassigned`.
6. Claim the case. Verify `Assigned to: Michael Chen`, status `IN PROGRESS`, and that Claim case is no longer available.
7. Send `Emergency care is alerted` and verify it appears in the activity/history.
8. Document a PHONE intervention with a contact time 10 minutes before local execution time, duration 15, person Patient, the supplied clinical and disposition notes, only the phone and follow-up visit actions, disposition `FOLLOW UP SCHEDULED`, and a next check-in 3 days later.
9. Sign and resolve. Verify the modal closes and the escalation becomes `RESOLVED`.
10. Refresh the still-authenticated patient context and verify the care-team message persists.

## Final status verification

ESC-001 passes only after the UI confirms the intervention submission, resolved status, and recorded history. A click alone is not considered success.
