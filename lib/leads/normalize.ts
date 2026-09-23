import { getCountryNameByCode } from '@/lib/utils/countryUtils';

/**
 * Every public form on the site posts a slightly different shape. This turns any
 * of them into a single row ready for the `leads` table.
 *
 * Handles: PublicQuoteRequest, EnhancedHeroWithQuote, LeadInquiryForm,
 * QuoteRequestContent, ContactPageContent, and the legacy `{ leadData: {...} }`
 * wrapper.
 */

export interface NormalizedLead {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  trade_show_name: string;
  event_date: string | null;
  venue: string | null;
  city: string;
  country: string;
  stand_size: number;
  budget: string;
  timeline: string;
  special_requests: string | null;
  lead_score: number;
  estimated_value: number | null;
  status: 'NEW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  source: string;
  source_details: string | null;
  referrer: string | null;
  targeted_builder_id: string | null;
  targeted_builder_name: string | null;
  is_general_inquiry: boolean;
  search_location_city: string | null;
  search_location_country: string | null;
  search_location_country_code: string | null;
  has_design_files: boolean;
  uploaded_files_count: number;
  attachments: string[] | null;
}

const NA = 'Not specified';

const first = (...vals: any[]): string =>
  (vals.find((v) => v !== undefined && v !== null && String(v).trim() !== '') ?? '')
    .toString()
    .trim();

function isUuid(v: any): v is string {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function toNumber(v: any): number {
  if (v === undefined || v === null) return 0;
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Pull a rough dollar figure out of a free-text budget string. */
function budgetToValue(budget: string): number | null {
  if (!budget) return null;
  const nums = (budget.match(/[\d,.]+/g) || []).map((s) => parseFloat(s.replace(/,/g, '')));
  if (!nums.length) return null;
  let max = Math.max(...nums);
  if (/k\b/i.test(budget) && max < 1000) max *= 1000;
  return Math.round(max) || null;
}

function mapPriority(raw: any, timeline: string): NormalizedLead['priority'] {
  const s = `${raw ?? ''} ${timeline}`.toLowerCase();
  if (/urgent|asap|immediately|this month|1-2 month|next month/.test(s)) return 'URGENT';
  if (/high|1-2 month|3 month/.test(s)) return 'HIGH';
  if (/low|no rush|flexible|next year|6\+ month/.test(s)) return 'LOW';
  return 'MEDIUM';
}

export function normalizeLead(raw: any, ctx?: { referrer?: string | null }): NormalizedLead {
  const b = raw && typeof raw === 'object' && raw.leadData ? raw.leadData : raw || {};

  const loc = b.location && typeof b.location === 'object' ? b.location : {};

  const fullName = first(b.fullName, b.name, [b.firstName, b.lastName].filter(Boolean).join(' '));
  const companyName = first(b.companyName, b.company_name, b.company);
  const contactName = first(b.contactPerson, b.contact_name, b.contactName, fullName, companyName, 'Not provided');
  const email = first(b.contactEmail, b.contact_email, b.email).toLowerCase();
  const phone = first(b.contactPhone, b.contact_phone, b.phone) || null;

  const tradeShow = first(
    b.tradeShow, b.trade_show_name, b.exhibitionName, b.selectedExhibition,
    b.customExhibition, b.customExhibitionName, b.customTradeShowName, b.eventName,
  ) || NA;

  // "Berlin, Germany" style free-text location (contact form)
  const evtLoc = first(b.eventLocation);
  const [evtCity, evtCountry] = evtLoc.includes(',')
    ? evtLoc.split(',').map((s: string) => s.trim())
    : [evtLoc, ''];

  const ccRaw = first(b.countryCode, b.country_code, loc.countryCode, loc.country_code).toUpperCase();
  const countryCode = /^[A-Z]{2}$/.test(ccRaw) ? ccRaw : null;
  const country = first(
    b.countryName, b.country, loc.country, evtCountry,
    countryCode && countryCode.length === 2 ? getCountryNameByCode(countryCode) : '',
    b.builderLocation,
  ) || NA;
  const city = first(b.cityName, b.city, loc.city, evtCity) || NA;

  const budget = first(b.budget, b.projectBudget, b.budgetRange, b.priceRange) || NA;
  const timeline = first(b.timeline, b.projectTimeline, b.urgencyTimeline, b.eventDates) || NA;
  const services = Array.isArray(b.services) && b.services.length ? `Services requested: ${b.services.join(', ')}. ` : '';
  const message = (services + first(b.message, b.specialRequests, b.special_requests, b.requirements, b.notes)).trim() || null;

  const targetedBuilderId = isUuid(b.builderId) ? b.builderId
    : isUuid(b.targetedBuilderId) ? b.targetedBuilderId
    : isUuid(b.targeted_builder_id) ? b.targeted_builder_id
    : null;
  const targetedBuilderName = first(b.builderName, b.targetedBuilderName, b.targeted_builder_name) || null;
  const isGeneral = !targetedBuilderId || String(b.builderId ?? '').includes('public') || String(b.builderId ?? '').includes('general');

  const source = first(b.source, b.formSource) || 'website';
  const standSize = toNumber(first(b.standSize, b.stand_size, b.boothSize, b.booth_size));

  // Collect attachments: prefer explicit array, then legacy single URL
  let attachments: string[] | null = null;
  if (Array.isArray(b.attachments) && b.attachments.length) attachments = b.attachments.filter((x: any) => typeof x === 'string' && x.trim()).slice(0, 20);
  else if (Array.isArray(b.uploadedFiles) && b.uploadedFiles.length) attachments = b.uploadedFiles.filter((x: any) => typeof x === 'string').slice(0, 20);
  else if (typeof b.attachments === 'string' && b.attachments.trim()) attachments = [b.attachments.trim()];
  else if (typeof b.fileUrl === 'string' && b.fileUrl.trim()) attachments = [b.fileUrl.trim()];

  return {
    company_name: companyName || 'Not provided',
    contact_name: contactName,
    contact_email: email,
    contact_phone: phone,
    trade_show_name: tradeShow,
    event_date: null,
    venue: first(b.venue) || null,
    city,
    country,
    stand_size: standSize,
    budget,
    timeline,
    special_requests: message,
    lead_score: Math.max(0, Math.min(100, toNumber(b.leadScore) || 55)),
    estimated_value: budgetToValue(budget),
    status: 'NEW',
    priority: mapPriority(b.urgency ?? b.priority, timeline),
    source,
    source_details: first(b.sourceDetails, b.pagePath, b.builderLocation) || null,
    referrer: ctx?.referrer || first(b.referrer) || null,
    targeted_builder_id: isGeneral ? null : targetedBuilderId,
    targeted_builder_name: isGeneral ? null : targetedBuilderName,
    is_general_inquiry: isGeneral,
    // Mirror the resolved city/country so the builder dashboard's location match works.
    search_location_city: city !== NA ? city : null,
    search_location_country: country !== NA ? country : null,
    search_location_country_code: countryCode,
    has_design_files: Boolean(b.hasDesign || b.has_design_files || b.hasDesignFiles || (attachments && attachments.length)),
    uploaded_files_count: toNumber(first(b.uploadedFilesCount, b.uploaded_files_count, attachments?.length)),
    attachments,
  };
}

/** Cheap in-memory throttle: max `limit` submissions per `windowMs` per key. */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length <= limit;
}
