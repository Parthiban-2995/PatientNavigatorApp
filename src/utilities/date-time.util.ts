export function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function interventionDateTimes(now: Date = new Date()): { contactDateTime: string; nextCheckIn: string } {
  const contact = new Date(now.getTime());
  contact.setMinutes(contact.getMinutes() - 10);
  const followUp = new Date(now.getTime());
  followUp.setDate(followUp.getDate() + 3);
  return { contactDateTime: formatLocalDateTime(contact), nextCheckIn: formatLocalDateTime(followUp) };
}
