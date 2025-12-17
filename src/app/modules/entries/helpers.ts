export function calculateEntryHours(timeIn: string, timeOut: string, breakTime?: string): number {
  if (!timeIn || !timeOut) return 0;

  const [inHour, inMinute] = timeIn.split(":").map(Number);
  const [outHour, outMinute] = timeOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMinute;
  const outMinutes = outHour * 60 + outMinute;

  const totalMinutes = outMinutes - inMinutes;
  const breakMinutes = breakTime ? parseInt(breakTime) : 0;
  const workMinutes = totalMinutes - breakMinutes;

  return Math.max(0, workMinutes / 60);
}
