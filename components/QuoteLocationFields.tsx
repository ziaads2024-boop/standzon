'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import { FieldLabel, fieldClass, selectContentClass, selectItemClass } from '@/components/quoteFormShared';

// Same 58-country list that gates the site's own /exhibition-stands/<country> routing
// (lib/data/globalCities.ts — the "live" list, per location-page-redesign conventions),
// so a country picked here matches a country the site actually has builders/pages for.
const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain', 'Al Ain'];

const COUNTRIES = [...GLOBAL_EXHIBITION_DATA.countries]
  .map((c) => ({
    name: c.name,
    majorCities: c.name === 'United Arab Emirates' ? UAE_CITIES : c.majorCities,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const OTHER_CITY = '__other__';

// Resolves a 2-letter country code to a name that exactly matches an entry in
// `COUNTRIES` above, so a page that already knows its country (e.g. a location page
// passing countryCode="AE") can pre-select the right option in this same dropdown.
export function countryNameFromCode(code?: string): string | undefined {
  if (!code) return undefined;
  return GLOBAL_EXHIBITION_DATA.countries.find((c) => c.countryCode === code.toUpperCase())?.name;
}

export function countryCodeFromName(name?: string): string | undefined {
  if (!name) return undefined;
  return GLOBAL_EXHIBITION_DATA.countries.find((c) => c.name.toLowerCase() === name.toLowerCase())?.countryCode;
}

const normalizeLocationPart = (value?: string) =>
  (value || '').trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Resolve the country/city already encoded in a location page's props. This keeps the
 * popup useful for older call sites that only pass `location="Dubai"` or
 * `location="Dubai, United Arab Emirates"`. It never invents a default country. */
export function resolveQuoteLocation({
  location,
  countryCode,
  cityName,
}: {
  location?: string;
  countryCode?: string;
  cityName?: string;
}): { country: string; city: string; countryCode: string } {
  const parts = (location || '').split(',').map((part) => part.trim()).filter(Boolean);
  const normalizedParts = parts.map(normalizeLocationPart);

  let country = countryNameFromCode(countryCode) || '';
  if (!country) {
    const countryMatch = GLOBAL_EXHIBITION_DATA.countries.find((candidate) => {
      const names = [candidate.name, candidate.slug, candidate.countryCode].map(normalizeLocationPart);
      return normalizedParts.some((part) => names.includes(part));
    });
    country = countryMatch?.name || '';
  }

  if (!country) {
    const emirate = UAE_CITIES.find((candidate) => normalizedParts.includes(normalizeLocationPart(candidate)));
    if (emirate) country = 'United Arab Emirates';
  }

  const countryRecord = COUNTRIES.find((candidate) => candidate.name === country);
  let city = (cityName || '').trim();
  if (!city && countryRecord) {
    city = countryRecord.majorCities.find((candidate) =>
      normalizedParts.includes(normalizeLocationPart(candidate))
    ) || '';
  }

  // A city-only page may not pass a country code. Resolve it only when the city name is
  // unique in the site's canonical location data.
  if (!country && !city) {
    const cityMatches = GLOBAL_EXHIBITION_DATA.cities.filter((candidate) =>
      normalizedParts.includes(normalizeLocationPart(candidate.name))
    );
    const uniqueCountries = new Set(cityMatches.map((candidate) => candidate.country));
    if (cityMatches.length && uniqueCountries.size === 1) {
      country = cityMatches[0].country;
      city = cityMatches[0].name;
    }
  }

  return {
    country,
    city,
    countryCode: countryCodeFromName(country) || countryCode?.toUpperCase() || '',
  };
}

export function QuoteLocationFields({
  country,
  city,
  onCountryChange,
  onCityChange,
  hideCountry = false,
  cityRequired = false,
}: {
  country: string;
  city: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  /** The popup already lives on a specific country's page — no point re-asking. The
   *  country is still tracked internally (it scopes the city list and the exhibitions
   *  fetch) and shown as a plain confirmation line instead of an editable dropdown. */
  hideCountry?: boolean;
  cityRequired?: boolean;
}) {
  const majorCities = useMemo(() => COUNTRIES.find((c) => c.name === country)?.majorCities || [], [country]);

  // Whether the city dropdown is in "type your own" mode — its own state rather than
  // inferred from `city`, since a just-picked "Other" starts as an EMPTY string (still
  // needs the free-text box to show) and a listed city can't tell the two apart on its own.
  const [otherMode, setOtherMode] = useState(() => !!city && !majorCities.includes(city));

  useEffect(() => {
    // Country changed (including a pre-filled initial value arriving after mount) — resync.
    setOtherMode(!!city && !majorCities.includes(city));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const cityField = (
    <div>
      <FieldLabel htmlFor="city">{cityRequired ? 'City *' : 'City (optional)'}</FieldLabel>
      {country && majorCities.length > 0 && !otherMode ? (
        <Select
          value={city}
          onValueChange={(v) => {
            if (v === OTHER_CITY) {
              setOtherMode(true);
              onCityChange('');
            } else {
              onCityChange(v);
            }
          }}
        >
          <SelectTrigger id="city" className={fieldClass}>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent className={`${selectContentClass} max-h-72`}>
            {majorCities.map((name) => (
              <SelectItem key={name} value={name} className={selectItemClass}>
                {name}
              </SelectItem>
            ))}
            <SelectItem value={OTHER_CITY} className={selectItemClass}>Other / not listed</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          id="city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder={country ? 'Enter your city' : 'Select a country first'}
          disabled={!country}
          className={fieldClass}
          autoFocus={otherMode}
        />
      )}
      {country && majorCities.length > 0 && otherMode && (
        <button
          type="button"
          onClick={() => { setOtherMode(false); onCityChange(''); }}
          className="mt-1 text-xs text-[#9A9B9C] underline hover:text-[#252525]"
        >
          ← choose from list instead
        </button>
      )}
    </div>
  );

  if (hideCountry) {
    // A country page already supplies the country, so do not render a redundant country
    // field. The compact confirmation keeps every auto-selected value visible.
    return (
      <div className="space-y-4">
        <div className="border border-[#E4E6E8] bg-[#F5F6F7] px-3 py-2.5 text-sm text-[#434444]" aria-live="polite">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A9B9C]">Location to confirm</span>
          <div className="mt-0.5 font-medium text-[#252525]">
            {city ? `${city}, ${country}` : country}
          </div>
        </div>
        {cityField}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <FieldLabel htmlFor="country">Country *</FieldLabel>
        <Select
          value={country}
          onValueChange={(v) => {
            onCountryChange(v);
            onCityChange(''); // a city from the old country is no longer valid
            setOtherMode(false);
          }}
        >
          <SelectTrigger id="country" className={fieldClass}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className={`${selectContentClass} max-h-72`}>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.name} value={c.name} className={selectItemClass}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {cityField}
    </div>
  );
}
