export function getNextRenewalDate(date: Date, intervalMonths = 1) {
  const nextRenewal = new Date(date);
  nextRenewal.setMonth(nextRenewal.getMonth() + intervalMonths);
  return nextRenewal;
}
