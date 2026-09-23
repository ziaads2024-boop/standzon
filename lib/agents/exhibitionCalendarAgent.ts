/**
 * Exhibition Calendar Sub-Agent — Deep Edition
 * Single responsibility: crawl trustworthy exhibition calendars for ALL website countries/cities,
 * normalize, and sync via service role key.
 *
 * Data lineage: every row stores `source_url` + `verified` (true only if official site confirms)
 * No invented cities beyond the website's canonical 58-country/204-city list.
 */

import { countriesWithCities } from '@/lib/data/countriesWithCities';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import { nextEligibleExhibitionStart } from '@/lib/utils/exhibitionDates';
import * as cheerio from 'cheerio';

export interface CalendarExhibition {
  name: string;
  slug: string;
  description?: string | null;
  city_name: string;
  country_name: string;
  country_code: string;
  venue?: string | null;
  venue_address?: string | null;
  start_date: string;
  end_date: string;
  year: number;
  month: number;
  frequency?: string | null;
  industry?: string | null;
  category?: string | null;
  expected_attendees?: number | null;
  expected_exhibitors?: number | null;
  website?: string | null;
  organizer_name?: string | null;
  organizer_email?: string | null;
  organizer_phone?: string | null;
  active: boolean;
  featured: boolean;
  verified: boolean;
  tags?: string[] | null;
  source_url: string;
  city_id?: string | null;
  country_id?: string | null;
}

export interface AgentRunReport {
  startedAt: string;
  finishedAt: string;
  totalCountries: number;
  totalCities: number;
  totalExhibitionsFound: number;
  byCountry: Record<string, { cities: number; exhibitions: number }>;
  errors: Array<{ country: string; city: string; error: string; source: string }>;
  sourceStats: Record<string, number>;
  durationMs: number;
}

export function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
export function exhibitionSlug(name: string, city: string, year: number): string {
  return slugify(`${name}-${city}-${year}`);
}

function normalizedLocationName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function canonicalCityName(country: string, city: string): string {
  const wanted = normalizedLocationName(city);
  return GLOBAL_EXHIBITION_DATA.cities.find((candidate) =>
    candidate.country === country && normalizedLocationName(candidate.name) === wanted
  )?.name || city.trim();
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  Germany: 'DE','United States': 'US','United Kingdom': 'GB',France: 'FR',Italy: 'IT',Spain: 'ES',Netherlands: 'NL',Australia: 'AU',Canada: 'CA',China: 'CN',Japan: 'JP',India: 'IN','United Arab Emirates': 'AE',Singapore: 'SG',Brazil: 'BR',Mexico: 'MX','South Korea': 'KR',Thailand: 'TH',Malaysia: 'MY',Indonesia: 'ID',Philippines: 'PH',Vietnam: 'VN',Taiwan: 'TW','Hong Kong': 'HK','New Zealand': 'NZ','South Africa': 'ZA',Egypt: 'EG',Nigeria: 'NG',Kenya: 'KE',Morocco: 'MA',Tunisia: 'TN',Algeria: 'DZ',Turkey: 'TR','Saudi Arabia': 'SA',Israel: 'IL',Jordan: 'JO',Lebanon: 'LB',Kuwait: 'KW',Qatar: 'QA',Bahrain: 'BH',Oman: 'OM',Iraq: 'IQ',Iran: 'IR',Pakistan: 'PK',Bangladesh: 'BD','Sri Lanka': 'LK',Nepal: 'NP',Myanmar: 'MM',Cambodia: 'KH',Laos: 'LA',Mongolia: 'MN',Kazakhstan: 'KZ',Uzbekistan: 'UZ',Kyrgyzstan: 'KG',Tajikistan: 'TJ',Turkmenistan: 'TM',Afghanistan: 'AF',Poland: 'PL','Czech Republic': 'CZ',Slovakia: 'SK',Hungary: 'HU',Romania: 'RO',Bulgaria: 'BG',Croatia: 'HR',Serbia: 'RS','Bosnia and Herzegovina': 'BA',Slovenia: 'SI',Albania: 'AL','North Macedonia': 'MK',Montenegro: 'ME',Kosovo: 'XK',Greece: 'GR',Cyprus: 'CY',Malta: 'MT',Iceland: 'IS',Norway: 'NO',Sweden: 'SE',Finland: 'FI',Denmark: 'DK',Estonia: 'EE',Latvia: 'LV',Lithuania: 'LT',Belarus: 'BY',Ukraine: 'UA',Moldova: 'MD',Russia: 'RU',Belgium: 'BE',Switzerland: 'CH',Austria: 'AT',Luxembourg: 'LU',Portugal: 'PT',Ireland: 'IE',Argentina: 'AR',Chile: 'CL',Colombia: 'CO',Peru: 'PE',Venezuela: 'VE',Ecuador: 'EC',Bolivia: 'BO',Paraguay: 'PY',Uruguay: 'UY',Guyana: 'GY',Suriname: 'SR','French Guiana': 'GF',
  // Additional from GLOBAL_COUNTRIES 57
  'Costa Rica': 'CR', Panama: 'PA', Guatemala: 'GT',
};
export function getCountryCode(country: string): string { return COUNTRY_CODE_MAP[country] || 'XX'; }

export interface FetchOptions {
  fetcher?: typeof fetch;
  limitCities?: number;
  politeDelayMs?: number;
  dryRun?: boolean;
  onProgress?: (msg: string) => void;
  deep?: boolean;
  useDbLocations?: boolean;
  countries?: string[]; // filter to specific countries (e.g. ["United Arab Emirates"] for UAE focus)
  yearFilter?: number[]; // filter exhibitions to specific years (e.g. [2026,2027] for this+next year)
}

export interface KnownExhibitionSeed {
  name: string; city: string; country: string; venue: string; website: string; source_url: string; industry: string; frequency: string;
}

// Discovery seeds only. A seed is never synced unless a trustworthy source yields exact future dates.
export const KNOWN_FAMOUS_SEEDS: KnownExhibitionSeed[] = [
  // Germany (10)
  { name: 'Hannover Messe', city: 'Hannover', country: 'Germany', venue: 'Deutsche Messe Hannover', website: 'https://www.hannovermesse.de', source_url: 'https://www.hannovermesse.de/en/', industry: 'Industrial Technology', frequency: 'Annual' },
  { name: 'Bauma', city: 'Munich', country: 'Germany', venue: 'Messe München', website: 'https://bauma.de', source_url: 'https://bauma.de/en/', industry: 'Construction', frequency: 'Triennial' },
  { name: 'Anuga', city: 'Cologne', country: 'Germany', venue: 'Koelnmesse', website: 'https://www.anuga.com', source_url: 'https://www.anuga.com/', industry: 'Food & Beverage', frequency: 'Biennial' },
  { name: 'Gamescom', city: 'Cologne', country: 'Germany', venue: 'Koelnmesse', website: 'https://www.gamescom.global', source_url: 'https://www.gamescom.global/', industry: 'Gaming', frequency: 'Annual' },
  { name: 'ITB Berlin', city: 'Berlin', country: 'Germany', venue: 'Messe Berlin', website: 'https://www.itb.com', source_url: 'https://www.itb.com/en/', industry: 'Tourism', frequency: 'Annual' },
  { name: 'IFA Berlin', city: 'Berlin', country: 'Germany', venue: 'Messe Berlin', website: 'https://www.ifa-berlin.com', source_url: 'https://www.ifa-berlin.com/', industry: 'Consumer Electronics', frequency: 'Annual' },
  { name: 'Ambiente', city: 'Frankfurt', country: 'Germany', venue: 'Messe Frankfurt', website: 'https://ambiente.messefrankfurt.com', source_url: 'https://ambiente.messefrankfurt.com/frankfurt/en.html', industry: 'Consumer Goods', frequency: 'Annual' },
  { name: 'Automechanika Frankfurt', city: 'Frankfurt', country: 'Germany', venue: 'Messe Frankfurt', website: 'https://automechanika.messefrankfurt.com', source_url: 'https://automechanika.messefrankfurt.com/frankfurt/en.html', industry: 'Automotive', frequency: 'Biennial' },
  { name: 'Medica', city: 'Düsseldorf', country: 'Germany', venue: 'Messe Düsseldorf', website: 'https://www.medica.de', source_url: 'https://www.medica.de/', industry: 'Healthcare', frequency: 'Annual' },
  { name: 'Interpack', city: 'Düsseldorf', country: 'Germany', venue: 'Messe Düsseldorf', website: 'https://www.interpack.com', source_url: 'https://www.interpack.com/', industry: 'Packaging', frequency: 'Triennial' },
  // UAE (4)
  { name: 'GITEX Global', city: 'Dubai', country: 'United Arab Emirates', venue: 'Dubai World Trade Centre', website: 'https://www.gitex.com', source_url: 'https://www.gitex.com/', industry: 'Technology', frequency: 'Annual' },
  { name: 'Arab Health', city: 'Dubai', country: 'United Arab Emirates', venue: 'Dubai World Trade Centre', website: 'https://www.arabhealthonline.com', source_url: 'https://www.arabhealthonline.com/', industry: 'Healthcare', frequency: 'Annual' },
  { name: 'Gulfood', city: 'Dubai', country: 'United Arab Emirates', venue: 'Dubai World Trade Centre', website: 'https://www.gulfood.com', source_url: 'https://www.gulfood.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'The Big 5', city: 'Dubai', country: 'United Arab Emirates', venue: 'Dubai World Trade Centre', website: 'https://www.thebig5.ae', source_url: 'https://www.thebig5.ae/', industry: 'Construction', frequency: 'Annual' },
  // UAE — other emirates (all 7 + Al Ain) — genuine sources
  { name: 'IDEX', city: 'Abu Dhabi', country: 'United Arab Emirates', venue: 'ADNEC Centre Abu Dhabi', website: 'https://www.idexuae.ae', source_url: 'https://www.idexuae.ae/', industry: 'Defense', frequency: 'Biennial' },
  { name: 'Sharjah International Book Fair', city: 'Sharjah', country: 'United Arab Emirates', venue: 'Expo Centre Sharjah', website: 'https://www.sibf.com', source_url: 'https://www.sibf.com/', industry: 'Publishing', frequency: 'Annual' },
  { name: 'Ajman International Education Fair', city: 'Ajman', country: 'United Arab Emirates', venue: 'Ajman Cultural Centre', website: 'https://www.ajman.ac.ae', source_url: 'https://www.ajman.ac.ae/', industry: 'Education', frequency: 'Annual' },
  { name: 'Fujairah International Arts Festival', city: 'Fujairah', country: 'United Arab Emirates', venue: 'Fujairah Exhibition Centre', website: 'https://www.fujairahfestival.ae', source_url: 'https://www.fujairahfestival.ae/', industry: 'Arts', frequency: 'Annual' },
  { name: 'Ras Al Khaimah Expo', city: 'Ras Al Khaimah', country: 'United Arab Emirates', venue: 'RAK Exhibition Centre', website: 'https://www.rakexpo.ae', source_url: 'https://www.rakexpo.ae/', industry: 'Trade', frequency: 'Annual' },
  { name: 'Umm Al Quwain Cultural Exhibition', city: 'Umm Al Quwain', country: 'United Arab Emirates', venue: 'Umm Al Quwain Cultural Centre', website: 'https://www.uaq.ae', source_url: 'https://www.uaq.ae/', industry: 'Culture', frequency: 'Annual' },
  { name: 'Al Ain International Book Fair', city: 'Al Ain', country: 'United Arab Emirates', venue: 'Al Ain Convention Centre', website: 'https://www.alainbookfair.com', source_url: 'https://www.alainbookfair.com/', industry: 'Publishing', frequency: 'Annual' },
  // USA (6)
  { name: 'CES', city: 'Las Vegas', country: 'United States', venue: 'Las Vegas Convention Center', website: 'https://www.ces.tech', source_url: 'https://www.ces.tech/', industry: 'Technology', frequency: 'Annual' },
  { name: 'NAB Show', city: 'Las Vegas', country: 'United States', venue: 'Las Vegas Convention Center', website: 'https://www.nabshow.com', source_url: 'https://www.nabshow.com/', industry: 'Media', frequency: 'Annual' },
  { name: 'MAGIC Las Vegas', city: 'Las Vegas', country: 'United States', venue: 'Las Vegas Convention Center', website: 'https://www.magicfashionevents.com', source_url: 'https://www.magicfashionevents.com/', industry: 'Fashion', frequency: 'Biennial' },
  { name: 'IMTS', city: 'Chicago', country: 'United States', venue: 'McCormick Place', website: 'https://www.imts.com', source_url: 'https://www.imts.com/', industry: 'Manufacturing', frequency: 'Biennial' },
  { name: 'NRA Show', city: 'Chicago', country: 'United States', venue: 'McCormick Place', website: 'https://www.nationalrestaurantshow.com', source_url: 'https://www.nationalrestaurantshow.com/', industry: 'Hospitality', frequency: 'Annual' },
  { name: 'New York Comic Con', city: 'New York', country: 'United States', venue: 'Javits Center', website: 'https://www.newyorkcomiccon.com', source_url: 'https://www.newyorkcomiccon.com/', industry: 'Entertainment', frequency: 'Annual' },
  // France (3)
  { name: 'SIAL Paris', city: 'Paris', country: 'France', venue: 'Paris Nord Villepinte', website: 'https://www.sialparis.com', source_url: 'https://www.sialparis.com/', industry: 'Food & Beverage', frequency: 'Biennial' },
  { name: 'Maison & Objet', city: 'Paris', country: 'France', venue: 'Paris Nord Villepinte', website: 'https://www.maison-objet.com', source_url: 'https://www.maison-objet.com/en/paris', industry: 'Design', frequency: 'Biennial' },
  { name: 'Cannes Lions', city: 'Cannes', country: 'France', venue: 'Palais des Festivals', website: 'https://www.canneslions.com', source_url: 'https://www.canneslions.com/', industry: 'Marketing', frequency: 'Annual' },
  // UK (2)
  { name: 'World Travel Market London', city: 'London', country: 'United Kingdom', venue: 'ExCeL London', website: 'https://www.wtm.com', source_url: 'https://www.wtm.com/london/en-gb.html', industry: 'Tourism', frequency: 'Annual' },
  { name: 'London Book Fair', city: 'London', country: 'United Kingdom', venue: 'Olympia London', website: 'https://www.londonbookfair.co.uk', source_url: 'https://www.londonbookfair.co.uk/', industry: 'Publishing', frequency: 'Annual' },
  // Spain (2)
  { name: 'Mobile World Congress', city: 'Barcelona', country: 'Spain', venue: 'Fira Barcelona', website: 'https://www.mwcbarcelona.com', source_url: 'https://www.mwcbarcelona.com/', industry: 'Technology', frequency: 'Annual' },
  { name: 'FITUR', city: 'Madrid', country: 'Spain', venue: 'IFEMA Madrid', website: 'https://www.ifema.es/fitur', source_url: 'https://www.ifema.es/en/fitur', industry: 'Tourism', frequency: 'Annual' },
  // Italy (2)
  { name: 'Salone del Mobile', city: 'Milan', country: 'Italy', venue: 'Fiera Milano', website: 'https://www.salonemilano.it', source_url: 'https://www.salonemilano.it/en', industry: 'Design', frequency: 'Annual' },
  { name: 'EICMA', city: 'Milan', country: 'Italy', venue: 'Fiera Milano', website: 'https://www.eicma.it', source_url: 'https://www.eicma.it/en/', industry: 'Automotive', frequency: 'Annual' },
  // China (2)
  { name: 'Canton Fair', city: 'Guangzhou', country: 'China', venue: 'Canton Fair Complex', website: 'https://www.cantonfair.org.cn', source_url: 'https://www.cantonfair.org.cn/en/', industry: 'Trade', frequency: 'Biennial' },
  { name: 'CIIE', city: 'Shanghai', country: 'China', venue: 'NECC Shanghai', website: 'https://www.ciie.org', source_url: 'https://www.ciie.org/zbh/en/', industry: 'Trade', frequency: 'Annual' },
  // Japan (2)
  { name: 'Tokyo Motor Show / Japan Mobility Show', city: 'Tokyo', country: 'Japan', venue: 'Tokyo Big Sight', website: 'https://www.japan-mobility-show.com', source_url: 'https://www.japan-mobility-show.com/en/', industry: 'Automotive', frequency: 'Biennial' },
  { name: 'FOODEX Japan', city: 'Tokyo', country: 'Japan', venue: 'Tokyo Big Sight', website: 'https://www.jma.or.jp/foodex/en/', source_url: 'https://www.jma.or.jp/foodex/en/', industry: 'Food & Beverage', frequency: 'Annual' },
  // Singapore (2)
  { name: 'Singapore Airshow', city: 'Singapore', country: 'Singapore', venue: 'Changi Exhibition Centre', website: 'https://www.singaporeairshow.com', source_url: 'https://www.singaporeairshow.com/', industry: 'Aerospace', frequency: 'Biennial' },
  { name: 'Food & Hotel Asia', city: 'Singapore', country: 'Singapore', venue: 'Singapore Expo', website: 'https://www.foodnhotelasia.com', source_url: 'https://www.foodnhotelasia.com/', industry: 'Food & Beverage', frequency: 'Biennial' },
  // === EXPANDED: 57_GLOBAL_COUNTRIES coverage (remaining 47) ===
  // Netherlands
  { name: 'IBC Amsterdam', city: 'Amsterdam', country: 'Netherlands', venue: 'RAI Amsterdam', website: 'https://www.ibc.org', source_url: 'https://www.ibc.org/', industry: 'Media', frequency: 'Annual' },
  { name: 'PLMA Amsterdam', city: 'Amsterdam', country: 'Netherlands', venue: 'RAI Amsterdam', website: 'https://www.plmainternational.com', source_url: 'https://www.plmainternational.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  // Australia
  { name: 'Fine Food Australia', city: 'Sydney', country: 'Australia', venue: 'ICC Sydney', website: 'https://finefoodaustralia.com.au', source_url: 'https://finefoodaustralia.com.au/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'CeBIT Australia', city: 'Sydney', country: 'Australia', venue: 'ICC Sydney', website: 'https://www.cebit.com.au', source_url: 'https://www.cebit.com.au/', industry: 'Technology', frequency: 'Annual' },
  // Canada
  { name: 'SIAL Canada', city: 'Toronto', country: 'Canada', venue: 'Enercare Centre Toronto', website: 'https://www.sialcanada.com', source_url: 'https://www.sialcanada.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'Canadian Manufacturing Technology Show', city: 'Toronto', country: 'Canada', venue: 'Toronto Congress Centre', website: 'https://www.cmts.ca', source_url: 'https://www.cmts.ca/', industry: 'Manufacturing', frequency: 'Biennial' },
  // South Korea
  { name: 'Seoul Food & Hotel', city: 'Seoul', country: 'South Korea', venue: 'KINTEX Seoul', website: 'https://www.seoulfood.or.kr', source_url: 'https://www.seoulfood.or.kr/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'Korea International Boat Show', city: 'Busan', country: 'South Korea', venue: 'BEXCO Busan', website: 'https://www.boatshow.kr', source_url: 'https://www.boatshow.kr/', industry: 'Marine', frequency: 'Annual' },
  // India
  { name: 'Auto Expo', city: 'New Delhi', country: 'India', venue: 'Bharat Mandapam New Delhi', website: 'https://www.autoexpo.in', source_url: 'https://www.autoexpo.in/', industry: 'Automotive', frequency: 'Biennial' },
  { name: 'India International Trade Fair', city: 'New Delhi', country: 'India', venue: 'Pragati Maidan New Delhi', website: 'https://www.indiatradefair.com', source_url: 'https://www.indiatradefair.com/', industry: 'Trade', frequency: 'Annual' },
  // Brazil
  { name: 'Hospitalar', city: 'São Paulo', country: 'Brazil', venue: 'São Paulo Expo', website: 'https://www.hospitalar.com', source_url: 'https://www.hospitalar.com/', industry: 'Healthcare', frequency: 'Annual' },
  { name: 'APAS Show', city: 'São Paulo', country: 'Brazil', venue: 'Expo Center Norte São Paulo', website: 'https://www.apasshow.com', source_url: 'https://www.apasshow.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  // Mexico
  { name: 'Expo Transporte', city: 'Guadalajara', country: 'Mexico', venue: 'Expo Guadalajara', website: 'https://www.expotransporte.com', source_url: 'https://www.expotransporte.com/', industry: 'Automotive', frequency: 'Annual' },
  { name: 'Expo Nacional Ferretera', city: 'Guadalajara', country: 'Mexico', venue: 'Expo Guadalajara', website: 'https://www.expoferretera.com.mx', source_url: 'https://www.expoferretera.com.mx/', industry: 'Hardware', frequency: 'Annual' },
  // South Africa
  { name: 'Africa Energy Indaba', city: 'Cape Town', country: 'South Africa', venue: 'CTICC Cape Town', website: 'https://www.africaenergyindaba.co.za', source_url: 'https://www.africaenergyindaba.co.za/', industry: 'Energy', frequency: 'Annual' },
  { name: 'Electra Mining Africa', city: 'Johannesburg', country: 'South Africa', venue: 'Expo Centre Johannesburg', website: 'https://www.electramining.co.za', source_url: 'https://www.electramining.co.za/', industry: 'Mining', frequency: 'Biennial' },
  // Thailand
  { name: 'Bangkok International Gift Fair', city: 'Bangkok', country: 'Thailand', venue: 'BITEC Bangkok', website: 'https://www.bigshow.co.th', source_url: 'https://www.bigshow.co.th/', industry: 'Consumer Goods', frequency: 'Annual' },
  { name: 'Thailand Lab', city: 'Bangkok', country: 'Thailand', venue: 'BITEC Bangkok', website: 'https://www.thailandlab.com', source_url: 'https://www.thailandlab.com/', industry: 'Laboratory', frequency: 'Annual' },
  // Malaysia
  { name: 'Malaysia International Halal Showcase', city: 'Kuala Lumpur', country: 'Malaysia', venue: 'MITEC Kuala Lumpur', website: 'https://www.halal.com.my', source_url: 'https://www.halal.com.my/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'Oil & Gas Asia', city: 'Kuala Lumpur', country: 'Malaysia', venue: 'KLCC Kuala Lumpur', website: 'https://www.oilandgas-asia.com', source_url: 'https://www.oilandgas-asia.com/', industry: 'Oil & Gas', frequency: 'Biennial' },
  // Egypt
  { name: 'Cairo International Fair', city: 'Cairo', country: 'Egypt', venue: 'Cairo International Fair Ground', website: 'https://www.cairofair.com', source_url: 'https://www.cairofair.com/', industry: 'Trade', frequency: 'Annual' },
  { name: 'Egypt Energy', city: 'Cairo', country: 'Egypt', venue: 'Egypt International Exhibition Center', website: 'https://www.egypt-energy.com', source_url: 'https://www.egypt-energy.com/', industry: 'Energy', frequency: 'Annual' },
  // Nigeria
  { name: 'Lagos International Trade Fair', city: 'Lagos', country: 'Nigeria', venue: 'Tafawa Balewa Square Lagos', website: 'https://www.lagosinternationaltradefair.com', source_url: 'https://www.lagosinternationaltradefair.com/', industry: 'Trade', frequency: 'Annual' },
  // Kenya
  { name: 'Kenya International Trade Exhibition', city: 'Nairobi', country: 'Kenya', venue: 'KICC Nairobi', website: 'https://www.kite-exhibition.com', source_url: 'https://www.kite-exhibition.com/', industry: 'Trade', frequency: 'Annual' },
  // Austria
  { name: 'Austropharm', city: 'Vienna', country: 'Austria', venue: 'Messe Wien Vienna', website: 'https://www.austropharm.at', source_url: 'https://www.austropharm.at/', industry: 'Healthcare', frequency: 'Biennial' },
  { name: 'Smart Automation Austria', city: 'Vienna', country: 'Austria', venue: 'Messe Wien', website: 'https://www.smart-automation.at', source_url: 'https://www.smart-automation.at/', industry: 'Automation', frequency: 'Biennial' },
  // Indonesia
  { name: 'Manufacturing Indonesia', city: 'Jakarta', country: 'Indonesia', venue: 'JIExpo Jakarta', website: 'https://www.manufacturingindonesia.com', source_url: 'https://www.manufacturingindonesia.com/', industry: 'Manufacturing', frequency: 'Annual' },
  { name: 'Food & Hotel Indonesia', city: 'Jakarta', country: 'Indonesia', venue: 'JIExpo Jakarta', website: 'https://www.fhi.pamerindo.com', source_url: 'https://www.fhi.pamerindo.com/', industry: 'Food & Beverage', frequency: 'Biennial' },
  // Philippines
  { name: 'Manila FAME', city: 'Manila', country: 'Philippines', venue: 'World Trade Center Manila', website: 'https://www.manilafame.com', source_url: 'https://www.manilafame.com/', industry: 'Furniture', frequency: 'Biennial' },
  { name: 'World Food Expo Manila', city: 'Manila', country: 'Philippines', venue: 'SMX Manila', website: 'https://www.wofex.com', source_url: 'https://www.wofex.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  // Vietnam
  { name: 'Vietnam Expo', city: 'Hanoi', country: 'Vietnam', venue: 'ICE Hanoi', website: 'https://www.vietnamexpo.com.vn', source_url: 'https://www.vietnamexpo.com.vn/', industry: 'Trade', frequency: 'Annual' },
  { name: 'Saigon Exhibition', city: 'Ho Chi Minh City', country: 'Vietnam', venue: 'SECC Ho Chi Minh City', website: 'https://www.secc.com.vn', source_url: 'https://www.secc.com.vn/', industry: 'Trade', frequency: 'Annual' },
  // Turkey
  { name: 'CNR Food Istanbul', city: 'Istanbul', country: 'Turkey', venue: 'CNR Expo Istanbul', website: 'https://www.cnrfoodistanbul.com', source_url: 'https://www.cnrfoodistanbul.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'WIN Eurasia', city: 'Istanbul', country: 'Turkey', venue: 'Tüyap Istanbul', website: 'https://www.win-eurasia.com', source_url: 'https://www.win-eurasia.com/', industry: 'Industrial', frequency: 'Annual' },
  // Poland
  { name: 'Warsaw Industry Week', city: 'Warsaw', country: 'Poland', venue: 'Ptak Warsaw Expo', website: 'https://www.industryweek.pl', source_url: 'https://www.industryweek.pl/', industry: 'Industrial', frequency: 'Annual' },
  { name: 'MSV Poznan', city: 'Poznan', country: 'Poland', venue: 'MTP Poznan', website: 'https://www.mtp.pl', source_url: 'https://www.mtp.pl/', industry: 'Industrial', frequency: 'Annual' },
  // Czech Republic
  { name: 'MSV Brno', city: 'Brno', country: 'Czech Republic', venue: 'BVV Brno', website: 'https://www.bvv.cz/msv', source_url: 'https://www.bvv.cz/msv/', industry: 'Industrial', frequency: 'Annual' },
  { name: 'For Arch Prague', city: 'Prague', country: 'Czech Republic', venue: 'PVA Prague', website: 'https://www.forarch.cz', source_url: 'https://www.forarch.cz/', industry: 'Construction', frequency: 'Annual' },
  // Bangladesh
  { name: 'Dhaka International Trade Fair', city: 'Dhaka', country: 'Bangladesh', venue: 'Bangabandhu Bangladesh-China Friendship Exhibition Center Dhaka', website: 'https://www.ditf.gov.bd', source_url: 'https://www.ditf.gov.bd/', industry: 'Trade', frequency: 'Annual' },
  // Pakistan
  { name: 'Dawn Expo Karachi', city: 'Karachi', country: 'Pakistan', venue: 'Karachi Expo Center', website: 'https://www.karachiexpo.com', source_url: 'https://www.karachiexpo.com/', industry: 'Trade', frequency: 'Annual' },
  { name: 'Lahore Expo', city: 'Lahore', country: 'Pakistan', venue: 'Expo Centre Lahore', website: 'https://www.lahoreexpo.com', source_url: 'https://www.lahoreexpo.com/', industry: 'Trade', frequency: 'Annual' },
  // Russia
  { name: 'MosBuild Moscow', city: 'Moscow', country: 'Russia', venue: 'Crocus Expo Moscow', website: 'https://www.mosbuild.com', source_url: 'https://www.mosbuild.com/', industry: 'Construction', frequency: 'Annual' },
  { name: 'Neva St Petersburg', city: 'Saint Petersburg', country: 'Russia', venue: 'ExpoForum St Petersburg', website: 'https://www.transtec-neva.com', source_url: 'https://www.transtec-neva.com/', industry: 'Maritime', frequency: 'Biennial' },
  // Sweden
  { name: 'Stockholm Furniture Fair', city: 'Stockholm', country: 'Sweden', venue: 'Stockholmsmässan Stockholm', website: 'https://www.stockholmfurniturefair.se', source_url: 'https://www.stockholmfurniturefair.se/', industry: 'Furniture', frequency: 'Annual' },
  // Norway
  { name: 'Nor-Shipping Oslo', city: 'Oslo', country: 'Norway', venue: 'NOVA Spektrum Oslo', website: 'https://www.nor-shipping.com', source_url: 'https://www.nor-shipping.com/', industry: 'Maritime', frequency: 'Biennial' },
  // Denmark
  { name: 'FoodTech Copenhagen', city: 'Copenhagen', country: 'Denmark', venue: 'MCH Copenhagen', website: 'https://www.foodtech.dk', source_url: 'https://www.foodtech.dk/', industry: 'Food & Beverage', frequency: 'Biennial' },
  // Finland
  { name: 'Habitare Helsinki', city: 'Helsinki', country: 'Finland', venue: 'Messukeskus Helsinki', website: 'https://www.habitare.fi', source_url: 'https://www.habitare.fi/', industry: 'Design', frequency: 'Annual' },
  // Belgium
  { name: 'Seafood Expo Global Brussels', city: 'Brussels', country: 'Belgium', venue: 'Brussels Expo', website: 'https://www.seafoodexpo.com', source_url: 'https://www.seafoodexpo.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  { name: 'Interieur Kortrijk', city: 'Kortrijk', country: 'Belgium', venue: 'Kortrijk Xpo', website: 'https://www.interieur.be', source_url: 'https://www.interieur.be/', industry: 'Design', frequency: 'Biennial' },
  // Switzerland
  { name: 'Baselworld', city: 'Basel', country: 'Switzerland', venue: 'Messe Basel', website: 'https://www.baselworld.com', source_url: 'https://www.baselworld.com/', industry: 'Jewelry', frequency: 'Annual' },
  { name: 'Geneva Motor Show', city: 'Geneva', country: 'Switzerland', venue: 'Palexpo Geneva', website: 'https://www.gims.swiss', source_url: 'https://www.gims.swiss/', industry: 'Automotive', frequency: 'Annual' },
  // Argentina
  { name: 'FIT Buenos Aires', city: 'Buenos Aires', country: 'Argentina', venue: 'La Rural Buenos Aires', website: 'https://www.fit.org.ar', source_url: 'https://www.fit.org.ar/', industry: 'Tourism', frequency: 'Annual' },
  // Chile
  { name: 'Expomin Santiago', city: 'Santiago', country: 'Chile', venue: 'Espacio Riesco Santiago', website: 'https://www.expomin.cl', source_url: 'https://www.expomin.cl/', industry: 'Mining', frequency: 'Biennial' },
  // Colombia
  { name: 'Feria Internacional de Bogotá', city: 'Bogotá', country: 'Colombia', venue: 'Corferias Bogotá', website: 'https://www.feriainternacional.com', source_url: 'https://www.feriainternacional.com/', industry: 'Industrial', frequency: 'Biennial' },
  // Peru
  { name: 'Expoalimentaria Lima', city: 'Lima', country: 'Peru', venue: 'Jockey Plaza Lima', website: 'https://www.expoalimentariaperu.com', source_url: 'https://www.expoalimentariaperu.com/', industry: 'Food & Beverage', frequency: 'Annual' },
  // Iraq
  { name: 'Baghdad International Fair', city: 'Baghdad', country: 'Iraq', venue: 'Baghdad International Fair Ground', website: 'https://www.baghdadfair.com', source_url: 'https://www.baghdadfair.com/', industry: 'Trade', frequency: 'Annual' },
  // Iran
  { name: 'Tehran International Fair', city: 'Tehran', country: 'Iran', venue: 'Tehran International Fairground', website: 'https://www.iranfair.com', source_url: 'https://www.iranfair.com/', industry: 'Trade', frequency: 'Annual' },
  // Jordan
  { name: 'SOFEX Amman', city: 'Amman', country: 'Jordan', venue: 'King Hussein Business Park Amman', website: 'https://www.sofexjordan.com', source_url: 'https://www.sofexjordan.com/', industry: 'Defense', frequency: 'Biennial' },
  // Lebanon
  { name: 'Project Lebanon Beirut', city: 'Beirut', country: 'Lebanon', venue: 'Seaside Arena Beirut', website: 'https://www.projectlebanon.com', source_url: 'https://www.projectlebanon.com/', industry: 'Construction', frequency: 'Annual' },
  // Israel
  { name: 'Agritech Tel Aviv', city: 'Tel Aviv', country: 'Israel', venue: 'Tel Aviv Fairgrounds', website: 'https://www.agritech.org.il', source_url: 'https://www.agritech.org.il/', industry: 'Agriculture', frequency: 'Triennial' },
  // Qatar
  { name: 'Project Qatar Doha', city: 'Doha', country: 'Qatar', venue: 'DECC Doha', website: 'https://www.projectqatar.com', source_url: 'https://www.projectqatar.com/', industry: 'Construction', frequency: 'Annual' },
  // Oman
  { name: 'Oman Health Muscat', city: 'Muscat', country: 'Oman', venue: 'Oman Convention & Exhibition Centre Muscat', website: 'https://www.omanhealth.com', source_url: 'https://www.omanhealth.com/', industry: 'Healthcare', frequency: 'Annual' },
  // Bahrain
  { name: 'Jewellery Arabia Bahrain', city: 'Manama', country: 'Bahrain', venue: 'Bahrain International Exhibition Centre', website: 'https://www.jewelleryarabia.com', source_url: 'https://www.jewelleryarabia.com/', industry: 'Jewelry', frequency: 'Annual' },
  // Kuwait
  { name: 'Kuwait International Fair', city: 'Kuwait City', country: 'Kuwait', venue: 'Kuwait International Fair Ground', website: 'https://www.kif.net.kw', source_url: 'https://www.kif.net.kw/', industry: 'Trade', frequency: 'Annual' },
  // Saudi Arabia
  { name: 'Saudi Build Riyadh', city: 'Riyadh', country: 'Saudi Arabia', venue: 'Riyadh International Convention & Exhibition Center', website: 'https://www.saudibuild.com', source_url: 'https://www.saudibuild.com/', industry: 'Construction', frequency: 'Annual' },
  { name: 'Big 5 Saudi Jeddah', city: 'Jeddah', country: 'Saudi Arabia', venue: 'Jeddah Center for Forums & Events', website: 'https://www.thebig5saudi.com', source_url: 'https://www.thebig5saudi.com/', industry: 'Construction', frequency: 'Annual' },
  // Additional for 57: Costa Rica, Panama, Guatemala, Ecuador
  { name: 'Expo Salud Costa Rica', city: 'San José', country: 'Costa Rica', venue: 'Centro de Eventos Pedregal San José', website: 'https://www.exposalud.cr', source_url: 'https://www.exposalud.cr/', industry: 'Healthcare', frequency: 'Annual' },
  { name: 'Expocomer Panama', city: 'Panama City', country: 'Panama', venue: 'Atlapa Convention Center Panama City', website: 'https://www.expocomer.com', source_url: 'https://www.expocomer.com/', industry: 'Trade', frequency: 'Annual' },
  { name: 'Feria Internacional Guatemala', city: 'Guatemala City', country: 'Guatemala', venue: 'Parque de la Industria Guatemala City', website: 'https://www.feriainternacional.com.gt', source_url: 'https://www.feriainternacional.com.gt/', industry: 'Trade', frequency: 'Annual' },
  { name: 'Expo Flores Quito', city: 'Quito', country: 'Ecuador', venue: 'Centro de Exposiciones Quito', website: 'https://www.expoflores.com', source_url: 'https://www.expoflores.com/', industry: 'Horticulture', frequency: 'Annual' },
];

export function normalizeExhibition(raw: {
  name: string; city: string; country: string; venue?: string; venue_address?: string; start_date: string; end_date: string; industry?: string; website?: string; source_url: string; organizer_name?: string; frequency?: string; description?: string; verified?: boolean; featured?: boolean;
}): CalendarExhibition | null {
  if (!raw.name || !raw.city || !raw.country || !raw.start_date || !raw.end_date || !raw.source_url) return null;
  const start = new Date(raw.start_date); const end = new Date(raw.end_date);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
  if (start < new Date(nextEligibleExhibitionStart())) return null;
  const city = canonicalCityName(raw.country.trim(), raw.city);
  const year = start.getUTCFullYear();
  const slug = exhibitionSlug(raw.name, city, year);
  const countryCode = getCountryCode(raw.country);
  return {
    name: raw.name.trim(), slug, description: raw.description?.trim() || null,
    city_name: city, country_name: raw.country.trim(), country_code: countryCode,
    venue: raw.venue?.trim() || null, venue_address: raw.venue_address?.trim() || null,
    start_date: start.toISOString(), end_date: end.toISOString(), year, month: start.getUTCMonth()+1,
    frequency: raw.frequency || null, industry: raw.industry || null, category: raw.industry || null,
    website: raw.website || raw.source_url, organizer_name: raw.organizer_name || null,
    active: true, featured: raw.featured || false, verified: raw.verified || false,
    source_url: raw.source_url, tags: raw.industry ? [raw.industry] : null,
  };
}

// === Deep scraping helpers ===
async function scrapeEventsEyeForCity(city: string, fetcher: typeof fetch, sourceStats: Record<string, number>, errors: AgentRunReport['errors'], country: string): Promise<CalendarExhibition[]> {
  const url = `https://www.eventseye.com/cgi-bin/tsearch.pl?keywords=${encodeURIComponent(city)}&lang=1`;
  try {
    const controller = new AbortController(); const t = setTimeout(()=> controller.abort(), 10000);
    const res = await fetcher(url, { signal: controller.signal, headers: { 'User-Agent': 'Standzon-ExhibitionCalendarAgent/1.0 (+https://standszone.com)' } }).catch(()=> null);
    clearTimeout(t);
    if (!res || !res.ok) return [];
    // Search-result pages do not expose reliable machine-readable dates. Do not turn
    // event names into guessed calendar rows; retain EventsEye only as a discovery source
    // until its detail-page parser can prove title, city, and exact dates together.
    await res.text();
    sourceStats['eventseye-discovery-only'] = (sourceStats['eventseye-discovery-only'] || 0) + 1;
    return [];
  } catch (e: any) {
    errors.push({ country, city, error: e.message, source: url });
    return [];
  }
}

async function scrapeTradeFairDatesForCountry(country: string, countryCode: string, fetcher: typeof fetch, sourceStats: Record<string, number>, errors: AgentRunReport['errors']): Promise<CalendarExhibition[]> {
  const Z_MAP: Record<string, string> = {
    Germany: '55', 'United States': '228', 'United Arab Emirates': '2', France: '73', 'United Kingdom': '75', Italy: '108', Spain: '70', Netherlands: '136', Australia: '16', Canada: '36', China: '47', Japan: '112', India: '103', Singapore: '192', Brazil: '28', Mexico: '141', 'South Korea': '114', Thailand: '213', Malaysia: '129', Indonesia: '101', Philippines: '178', Vietnam: '238', Turkey: '216', Poland: '170', 'Czech Republic': '54', Bangladesh: '23', Pakistan: '169', Russia: '185', Sweden: '202', Norway: '164', Denmark: '58', Finland: '67', Belgium: '24', Switzerland: '202', Austria: '15', Argentina: '11', Chile: '44', Colombia: '48', Peru: '172', Iraq: '102', Iran: '99', Jordan: '109', Lebanon: '122', Israel: '100', Qatar: '180', Oman: '165', Bahrain: '22', Kuwait: '118', 'Saudi Arabia': '187', Egypt: '61', Nigeria: '160', Kenya: '113', 'South Africa': '197', Greece: '80', Portugal: '175', Ireland: '97', Hungary: '92', Romania: '184', Bulgaria: '33', Croatia: '50', Serbia: '190', Slovakia: '196', Slovenia: '200', Iceland: '98', Estonia: '64', Latvia: '121', Lithuania: '123', Cyprus: '52', Malta: '131',
  };
  const SLUG_MAP: Record<string, string> = {
    'United States': 'USA', 'United Arab Emirates': 'UAE', 'United Kingdom': 'United-Kingdom-of-Great-Britain-and-Northern-Ireland', 'South Korea': 'South-Korea', 'Czech Republic': 'Czech-Republic', 'Saudi Arabia': 'Saudi-Arabia', 'South Africa': 'South-Africa', 'New Zealand': 'New-Zealand', 'Sri Lanka': 'Sri-Lanka',
  };
  const z = Z_MAP[country];
  if (!z) return [];
  const exhibitions: CalendarExhibition[] = [];
  const slug = SLUG_MAP[country] || country;
  for (const page of [1]) {
    const url = `https://www.tradefairdates.com/Fairs-${encodeURIComponent(slug)}-Z${z}-S${page}.html`;
    try {
      const controller = new AbortController(); const t = setTimeout(()=> controller.abort(), 10000);
      const res = await fetcher(url, { signal: controller.signal, headers: { 'User-Agent': 'Standzon-ExhibitionCalendarAgent/1.0 (+https://standszone.com)' } }).catch(()=> null);
      clearTimeout(t);
      if (!res || !res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      // Correct parsing: div.tileHeader with a[title] and div.time
      const tiles = $('div.tileHeader');
      let count = 0;
      tiles.each((_, el) => {
        if (count >= 6) return false;
        const a = $(el).find('a[title]');
        const title = a.attr('title') || '';
        const time = $(el).find('div.time').text().trim();
        if (!title || !time) return;
        // title like "area30 2026, Löhne" -> name=area30, city=Löhne
        const parts = title.split(',');
        const city = parts[1]?.trim() || country;
        let name = parts[0]?.trim() || '';
        // Remove year from name like "area30 2026" -> "area30"
        name = name.replace(/\s+20\d{2}$/, '').trim();
        if (!name || name.length < 2) return;
        // time like "19. - 24. September 2026"
        const m = time.match(/(\d{1,2})\.\s*-\s*(\d{1,2})\.\s*([A-Za-z]+)\s+(\d{4})/);
        if (!m) return;
        const dayStart = parseInt(m[1],10); const dayEnd = parseInt(m[2],10); const monthStr = m[3]; const year = parseInt(m[4],10);
        const monthMap: Record<string, number> = { January:1, February:2, March:3, April:4, May:5, June:6, July:7, August:8, September:9, October:10, November:11, December:12 };
        const month = monthMap[monthStr] || 6;
        const href = a.attr('href') || '';
        const sourceUrl = href ? `https://www.tradefairdates.com${href}` : url;
        const start = new Date(year, month-1, dayStart).toISOString(); const end = new Date(year, month-1, dayEnd).toISOString();
        const ex = normalizeExhibition({ name, city, country, start_date: start, end_date: end, source_url: sourceUrl, industry: 'Trade', verified: false, featured: false });
        if (ex && !exhibitions.some(e=> e.slug===ex.slug)) { exhibitions.push(ex); count++; }
      });
      if (exhibitions.length) sourceStats['tradefairdates:'+country] = (sourceStats['tradefairdates:'+country]||0)+exhibitions.length;
    } catch (e:any) { errors.push({ country, city: country, error: e.message, source: `tradefairdates:${country}` }); }
  }
  return exhibitions;
}

export async function runCalendarAgent(options: FetchOptions = {}): Promise<{ exhibitions: CalendarExhibition[]; report: AgentRunReport; }> {
  const fetcher = options.fetcher || fetch;
  const politeDelayMs = options.politeDelayMs ?? 80;
  const onProgress = options.onProgress || (() => {});
  const deep = options.deep ?? true;
  const startedAt = new Date().toISOString(); const startMs = Date.now();

  // Load the website's actual 58-country/204-city location set by default, or Supabase
  // when explicitly requested.
  let allCountries: string[] = [];
  let cityList: Array<{ country: string; city: string }> = [];
  let totalCities = 0;

  if (options.useDbLocations === true) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
      if (url && key) {
        const admin = createClient(url, key);
        const { data: dbCountries } = await admin.from('countries').select('country_name').eq('active', true);
        if (dbCountries && dbCountries.length > 0) {
          allCountries = dbCountries.map((c:any)=> c.country_name);
          const { data: dbCities } = await admin.from('cities').select('city_name, country_name').eq('active', true);
          if (dbCities) {
            cityList = dbCities.map((c:any)=> ({ country: c.country_name, city: c.city_name }));
            totalCities = cityList.length;
            onProgress(`Loaded ${allCountries.length} countries, ${totalCities} cities from Supabase (useDbLocations=true)`);
          }
        }
      }
    } catch {}
  }

  // Default: the same canonical source used by the quote location selector.
  if (allCountries.length === 0) {
    try {
      allCountries = GLOBAL_EXHIBITION_DATA.countries.map((country) => country.name);
      cityList = GLOBAL_EXHIBITION_DATA.cities.map((city) => ({ country: city.country, city: city.name }));
      totalCities = cityList.length;
      onProgress(`Using website canonical locations: ${allCountries.length} countries, ${totalCities} cities`);
    } catch {
      allCountries = Object.keys(countriesWithCities);
      totalCities = Object.values(countriesWithCities).reduce((s,c)=> s+c.length,0);
      for (const [country, cities] of Object.entries(countriesWithCities)) {
        for (const city of cities as string[]) cityList.push({ country, city });
      }
      onProgress(`Fallback to countriesWithCities: ${allCountries.length} countries, ${totalCities} cities`);
    }
  }

  // Filter to specific countries if requested (e.g. UAE focus)
  if (options.countries && options.countries.length > 0) {
    const filterSet = new Set(options.countries.map(c => c.toLowerCase()));
    allCountries = allCountries.filter(c => filterSet.has(c.toLowerCase()));
    cityList = cityList.filter(c => filterSet.has(c.country.toLowerCase()));
    totalCities = cityList.length;
    onProgress(`Filtered to ${allCountries.length} countries, ${totalCities} cities via countries filter: ${options.countries.join(', ')}`);
  }

  if (options.limitCities) cityList = cityList.slice(0, options.limitCities);

  // UAE emirates expansion: ensure all 7 emirates + Al Ain are in cityList when UAE is requested
  if (options.countries?.some(c => c.toLowerCase().includes('united arab emirates') || c.toLowerCase() === 'uae')) {
    const UAE_EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Fujairah", "Ras Al Khaimah", "Umm Al Quwain", "Al Ain"];
    for (const emirate of UAE_EMIRATES) {
      if (!cityList.some(c => c.city.toLowerCase() === emirate.toLowerCase() && c.country === "United Arab Emirates")) {
        cityList.push({ country: "United Arab Emirates", city: emirate });
        totalCities++;
      }
    }
    if (!allCountries.includes("United Arab Emirates")) allCountries.push("United Arab Emirates");
    onProgress(`UAE emirates expanded: now ${cityList.filter(c=> c.country==="United Arab Emirates").length} emirate cities`);
  }

  const exhibitionsMap = new Map<string, CalendarExhibition>();
  const errors: AgentRunReport['errors'] = [];
  const sourceStats: Record<string, number> = {};
  const byCountry: Record<string, { cities: number; exhibitions: number }> = {};

  async function refreshSeed(seed: KnownExhibitionSeed): Promise<CalendarExhibition | null> {
    try {
      const controller = new AbortController(); const t = setTimeout(()=> controller.abort(), 4000);
      const res = await fetcher(seed.source_url, { signal: controller.signal, headers: { 'User-Agent': 'Standzon-ExhibitionCalendarAgent/1.0 (+https://standszone.com)' } }).catch(()=> null);
      clearTimeout(t);
      if (res && res.ok) {
        const html = await res.text().catch(()=> '');
        const dateInfo = extractDatesFromHtml(html, seed.name);
        if (dateInfo) {
          const n = normalizeExhibition({ name: seed.name, city: seed.city, country: seed.country, venue: seed.venue, start_date: dateInfo.start, end_date: dateInfo.end, industry: seed.industry, website: seed.website, source_url: seed.source_url, frequency: seed.frequency, verified: true, featured: true });
          if (n) { sourceStats[seed.source_url] = (sourceStats[seed.source_url]||0)+1; return n; }
        }
      }
      errors.push({ country: seed.country, city: seed.city, error: 'Official page did not expose a matching Event with exact future dates', source: seed.source_url });
      return null;
    } catch (e:any) { errors.push({ country: seed.country, city: seed.city, error: e.message, source: seed.source_url }); return null; }
  }

  const seedsToProcess = options.countries && options.countries.length > 0
    ? KNOWN_FAMOUS_SEEDS.filter(s => options.countries!.some(c => c.toLowerCase() === s.country.toLowerCase() || (c.toLowerCase()==='uae' && s.country==='United Arab Emirates')))
    : KNOWN_FAMOUS_SEEDS;
  onProgress(`Refreshing ${seedsToProcess.length} known famous exhibitions via genuine sources...`);
  const concurrency = 8;
  for (let i=0; i< seedsToProcess.length; i+= concurrency) {
    const batch = seedsToProcess.slice(i, i+concurrency);
    const results = await Promise.all(batch.map(s=> refreshSeed(s)));
    for (const ex of results) if (ex && !exhibitionsMap.has(ex.slug)) { exhibitionsMap.set(ex.slug, ex); if (!byCountry[ex.country_name]) byCountry[ex.country_name]={cities:0, exhibitions:0}; byCountry[ex.country_name].exhibitions++; }
    if (politeDelayMs && i+concurrency < seedsToProcess.length) await new Promise(r=> setTimeout(r, politeDelayMs));
  }

  // Mark cities
  for (const { country } of cityList) { if (!byCountry[country]) byCountry[country]={cities:0, exhibitions:0}; }
  // Count cities per country
  const cityCountByCountry: Record<string, number> = {};
  for (const { country } of cityList) cityCountByCountry[country]=(cityCountByCountry[country]||0)+1;
  for (const c of allCountries) { if (!byCountry[c]) byCountry[c]={cities: cityCountByCountry[c]||0, exhibitions:0}; else byCountry[c].cities = cityCountByCountry[c]||0; }

  // Deep scraping: tradefairdates country pages + eventseye city search (respects limitCities)
  if (deep) {
    const countriesForDeep = options.limitCities ? [...new Set(cityList.map(c=> c.country))] : allCountries.slice(0, 30); // top 30 for full sync to stay within 300s
    onProgress(`Deep discovery: tradefairdates country pages for ${countriesForDeep.length} countries...`);
    for (let i=0;i< countriesForDeep.length; i+=5) {
      const batch = countriesForDeep.slice(i, i+5);
      const results = await Promise.all(batch.map(c=> scrapeTradeFairDatesForCountry(c, getCountryCode(c), fetcher, sourceStats, errors)));
      for (const list of results) for (const ex of list) if (!exhibitionsMap.has(ex.slug)) { exhibitionsMap.set(ex.slug, ex); if (!byCountry[ex.country_name]) byCountry[ex.country_name]={cities:0, exhibitions:0}; byCountry[ex.country_name].exhibitions++; }
      if (politeDelayMs) await new Promise(r=> setTimeout(r, politeDelayMs*2));
    }
    const hubLimit = options.limitCities ? Math.min(cityList.length, 20) : 40;
    onProgress(`Deep discovery: EventsEye city search for ${hubLimit} hub cities...`);
    const hubCities = cityList.slice(0, hubLimit);
    for (let i=0;i< hubCities.length; i+=5) {
      const batch = hubCities.slice(i,i+5);
      const results = await Promise.all(batch.map(c=> scrapeEventsEyeForCity(c.city, fetcher, sourceStats, errors, c.country)));
      for (const list of results) for (const ex of list) if (!exhibitionsMap.has(ex.slug)) { exhibitionsMap.set(ex.slug, ex); if (!byCountry[ex.country_name]) byCountry[ex.country_name]={cities:0, exhibitions:0}; byCountry[ex.country_name].exhibitions++; }
      if (politeDelayMs) await new Promise(r=> setTimeout(r, politeDelayMs));
    }
  }

  let exhibitions = Array.from(exhibitionsMap.values());
  // Filter to requested years (e.g. UAE: this year + next)
  if (options.yearFilter && options.yearFilter.length > 0) {
    const allowed = new Set(options.yearFilter);
    const before = exhibitions.length;
    exhibitions = exhibitions.filter(e => allowed.has(e.year));
    onProgress(`Year filter ${options.yearFilter.join(',')}: ${before} → ${exhibitions.length} exhibitions`);
    // Rebuild byCountry counts after filter
    const newByCountry: Record<string, { cities: number; exhibitions: number }> = {};
    for (const c of allCountries) newByCountry[c] = { cities: cityCountByCountry[c]||0, exhibitions: 0 };
    for (const ex of exhibitions) {
      if (!newByCountry[ex.country_name]) newByCountry[ex.country_name] = { cities: 0, exhibitions: 0 };
      newByCountry[ex.country_name].exhibitions++;
    }
    // Replace
    Object.keys(byCountry).forEach(k => delete byCountry[k]);
    Object.assign(byCountry, newByCountry);
  }

  const report: AgentRunReport = {
    startedAt, finishedAt: new Date().toISOString(),
    totalCountries: allCountries.length, totalCities,
    totalExhibitionsFound: exhibitions.length, byCountry, errors, sourceStats, durationMs: Date.now()-startMs,
  };
  onProgress(`Agent complete: ${exhibitions.length} exhibitions across ${Object.keys(byCountry).filter(k=> byCountry[k].exhibitions>0).length} countries in ${report.durationMs}ms`);
  return { exhibitions, report };
}

function extractDatesFromHtml(html: string, expectedName: string): { start: string; end: string } | null {
  if (!html || html.length < 500) return null;
  const $ = cheerio.load(html);
  const expectedTokens = new Set(normalizedLocationName(expectedName).split(' ').filter((token) => token.length > 2));
  const candidates: any[] = [];

  const visit = (value: any) => {
    if (!value) return;
    if (Array.isArray(value)) return value.forEach(visit);
    if (typeof value !== 'object') return;
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.some((type) => String(type).toLowerCase() === 'event')) candidates.push(value);
    if (value['@graph']) visit(value['@graph']);
  };

  $('script[type="application/ld+json"]').each((_, element) => {
    try { visit(JSON.parse($(element).text())); } catch {}
  });

  for (const event of candidates) {
    const actualTokens = new Set(normalizedLocationName(String(event.name || '')).split(' '));
    const matchesName = expectedTokens.size === 0 || [...expectedTokens].some((token) => actualTokens.has(token));
    if (!matchesName || !event.startDate) continue;
    const start = new Date(event.startDate);
    const end = new Date(event.endDate || event.startDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
      return { start: start.toISOString(), end: end.toISOString() };
    }
  }
  return null;
}

export async function prepareExhibitionRows(exhibitions: CalendarExhibition[], supabaseAdmin: any): Promise<{ cityIdMap: Map<string, string>; countryIdMap: Map<string, string> }> {
  const cityIdMap = new Map<string, string>(); const countryIdMap = new Map<string, string>();
  if (!supabaseAdmin) return { cityIdMap, countryIdMap };
  try {
    const { data: countries } = await supabaseAdmin.from('countries').select('id, country_name, country_code');
    if (countries) for (const c of countries) { countryIdMap.set(c.country_name.toLowerCase(), c.id); countryIdMap.set(c.country_code.toLowerCase(), c.id); }
    const { data: cities } = await supabaseAdmin.from('cities').select('id, city_name, country_code');
    if (cities) for (const ci of cities) cityIdMap.set(`${ci.city_name.toLowerCase()}|${ci.country_code.toLowerCase()}`, ci.id);
  } catch (e) { console.warn('Could not resolve IDs', e); }
  for (const ex of exhibitions) {
    const countryKey = ex.country_name.toLowerCase(); const cityKey = `${ex.city_name.toLowerCase()}|${ex.country_code.toLowerCase()}`;
    if (countryIdMap.has(countryKey)) ex.country_id = countryIdMap.get(countryKey)!;
    if (cityIdMap.has(cityKey)) ex.city_id = cityIdMap.get(cityKey)!;
  }
  return { cityIdMap, countryIdMap };
}
