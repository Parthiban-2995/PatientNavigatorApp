export type EscalationScenario = {
  patientMessage: string;
  assistantResponse: string;
  safetyMessage: string;
  priority: string;
  careNote: string;
  intervention: {
    clinicalNote: string;
    dispositionNotes: string;
    durationMinutes: string;
    contactMethod: string;
    personSpokenTo: string;
    disposition: string;
  };
};

type EscalationScenarioOverrides = Omit<Partial<EscalationScenario>, 'intervention'> & {
  intervention?: Partial<EscalationScenario['intervention']>;
};

const defaultEscalationScenario: EscalationScenario = {
  patientMessage: 'I feel dizzy',
  assistantResponse: 'This could be an emergency. Call 911 now. Do not wait for a reply here or drive yourself. If you can, ask someone nearby to stay with you.',
  safetyMessage: 'Do not start, stop, skip, or change a medicine until a care-team member has reviewed your request.',
  priority: 'CRITICAL',
  careNote: 'Emergency care is alerted',
  intervention: {
    clinicalNote: 'Patient assessed, appropriate care/intervention provided, and patient responded positively with no adverse reactions noted.',
    dispositionNotes: 'Patient stable, care completed, and discharged with appropriate advice and follow-up instructions.',
    durationMinutes: '15',
    contactMethod: 'PHONE',
    personSpokenTo: 'Patient',
    disposition: 'FOLLOW UP SCHEDULED',
  },
};

export function createEscalationScenario(
  overrides: EscalationScenarioOverrides = {},
): EscalationScenario {
  return {
    ...defaultEscalationScenario,
    ...overrides,
    intervention: {
      ...defaultEscalationScenario.intervention,
      ...overrides.intervention,
    },
  };
}
