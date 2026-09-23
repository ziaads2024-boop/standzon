# Verified exhibition calendar staging batch

Research cutoff: `2026-09-23` (Asia/Kolkata). Every staged event starts after
that date. Events starting on the cutoff date are intentionally excluded.

`verified-future-exhibitions-2026-09-23.json` is a research-only batch shaped
like `CalendarExhibition` / the Supabase `exhibitions` payload. It has not been
imported into Supabase.

Verification rules used for this batch:

1. The source is the event organizer, official venue, government exhibition
   body, or official event owner.
2. The source explicitly states the event name, future dates, and city/venue.
3. Recurrence was never used to invent a future date.
4. The city and country values use the repository's canonical generated
   calendar list (`GLOBAL_EXHIBITION_DATA.cities`) where available.
5. `verified: true` means the dates and location were confirmed on the linked
   first-party source on 2026-09-23. It does not mean the event can never be
   rescheduled; production sync should re-check the source before upsert.

Known repository issue: the canonical city is spelled `Dusseldorf`, while the
official German spelling is `Düsseldorf`. The MEDICA row uses `Dusseldorf` so
it will join to the current city filter/FK. A future location-alias migration
should fix this without changing the source evidence.

This is an initial verified batch, not a claim of complete global coverage.
Completeness across the current 58 countries and 204 generated cities requires an incremental,
auditable pipeline and will often correctly yield zero events for cities that
do not host major exhibitions.
