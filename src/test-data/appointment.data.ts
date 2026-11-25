export type AppointmentScenario = {
  reason: string;
};

export function createAppointmentScenario(
  overrides: Partial<AppointmentScenario> = {},
): AppointmentScenario {
  return {
    reason: `Routine follow-up test ${Date.now()}`,
    ...overrides,
  };
}
