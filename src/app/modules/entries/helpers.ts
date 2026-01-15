export function calculateEntryHours(timeIn: string, timeOut: string, breakTime?: string): number {
  if (!timeIn || !timeOut) {
    console.warn("Invalid time entry:", { timeIn, timeOut });
    return 0;
  }

  try {
    const [inHour, inMinute] = timeIn.split(":").map(Number);
    const [outHour, outMinute] = timeOut.split(":").map(Number);

    // Validate parsed values
    if (isNaN(inHour) || isNaN(inMinute) || isNaN(outHour) || isNaN(outMinute)) {
      console.error("Invalid time format:", { timeIn, timeOut });
      return 0;
    }

    const inMinutes = inHour * 60 + inMinute;
    const outMinutes = outHour * 60 + outMinute;

    const totalMinutes = outMinutes - inMinutes;
    const breakMinutes = breakTime ? parseInt(breakTime) || 0 : 0;
    const workMinutes = totalMinutes - breakMinutes;

    const hours = Math.max(0, workMinutes / 60);
    
    return hours;
  } catch (error) {
    console.error("Error calculating entry hours:", error, { timeIn, timeOut, breakTime });
    return 0;
  }
}
