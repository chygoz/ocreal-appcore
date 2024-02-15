export function calculateDaysBetweenDates(
  startDateStr: Date,
  endDateStr: Date,
): number {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const millisecondsPerDay = 1000 * 60 * 60 * 24; // Number of milliseconds in a day
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  const differenceInDays = Math.floor(
    differenceInMilliseconds / millisecondsPerDay,
  );
  return differenceInDays;
}
