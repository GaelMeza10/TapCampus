export type OfferDurationProps = { value: number; onChange: (minutes: number) => void; disabled?: boolean; error?: string; maxMinutes: number };
export function durationParts(value: number) {
  const minutes = Number.isSafeInteger(value) && value >= 0 ? value : 0;
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
export function maximumOfferMinutes(start: number, end: number, now: number) {
  if (![start, end, now].every(Number.isFinite)) return 0;
  return Math.max(0, Math.min(2147483647, Math.ceil((end - Math.max(start, now)) / 60000) - 1));
}
