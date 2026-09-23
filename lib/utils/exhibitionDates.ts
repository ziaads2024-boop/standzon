/**
 * Calendar rows are stored as timestamps, but exhibition eligibility is date-based:
 * an event whose start date is today must not appear even if its stored time is later.
 * Using the next UTC midnight also behaves consistently across server regions.
 */
export function nextEligibleExhibitionStart(now: Date = new Date()): string {
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  )).toISOString();
}

