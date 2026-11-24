export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createExactTextMatcher(value: string, flags = ''): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(value)}\\s*$`, flags);
}
