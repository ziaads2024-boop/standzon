/**
 * Utility functions for consistent slug generation and normalization
 */

import { COUNTRY_CODES } from '@/lib/data/countryCodes';

const COUNTRY_SLUG_ALIASES: Record<string, string> = {
  uae: 'united-arab-emirates',
  usa: 'united-states',
  uk: 'united-kingdom',
  'great-britain': 'united-kingdom',
};

/**
 * Normalizes a string into a URL-friendly slug
 * Ensures consistent formatting across the application
 */
export function normalizeSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word chars (except hyphens)
    .replace(/\-\-+/g, '-')   // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')       // Trim hyphens from start
    .replace(/-+$/, '');      // Trim hyphens from end
}

const COUNTRY_SLUG_BY_CODE = new Map(
  COUNTRY_CODES.map((country) => [country.code.toLowerCase(), normalizeSlug(country.name)])
);

/**
 * Normalizes a country name into a URL-friendly slug
 */
export function normalizeCountrySlug(countryName: string): string {
  const normalizedInput = normalizeSlug(countryName);
  return (
    COUNTRY_SLUG_ALIASES[normalizedInput] ||
    COUNTRY_SLUG_BY_CODE.get(normalizedInput) ||
    normalizedInput
  );
}

/**
 * Normalizes a city name into a URL-friendly slug
 */
export function normalizeCitySlug(cityName: string): string {
  return normalizeSlug(cityName);
}

/**
 * Generates a full URL path for a country page
 */
export function getCountryPageUrl(countryName: string): string {
  return `/exhibition-stands/${normalizeCountrySlug(countryName)}`;
}

/**
 * Generates a full URL path for a city page
 */
export function getCityPageUrl(countryName: string, cityName: string): string {
  return `/exhibition-stands/${normalizeCountrySlug(countryName)}/${normalizeCitySlug(cityName)}`;
}
