// Trustworthy Exhibition Calendar Sources
// ONLY genuine professional sources - no dummy data
// Priority 1: Official venue/organizer sites, Priority 2: UFI-certified aggregators

export interface TrustworthySource {
  id: string;
  name: string;
  baseUrl: string;
  calendarUrl: string; // direct calendar/listings URL
  type: 'official_venue' | 'official_organizer' | 'ufi_certified_aggregator' | 'government';
  trustScore: number; // 1-10
  coverage: string[]; // countries covered, or ['global']
  apiAvailable?: boolean;
  scrapingAllowed?: boolean;
  notes: string;
}

export const TRUSTWORTHY_SOURCES: TrustworthySource[] = [
  // === UFI CERTIFIED AGGREGATORS (Top Tier) ===
  {
    id: '10times',
    name: '10Times - Global Exhibition Calendar',
    baseUrl: 'https://10times.com',
    calendarUrl: 'https://10times.com/exhibitions',
    type: 'ufi_certified_aggregator',
    trustScore: 9,
    coverage: ['global'],
    scrapingAllowed: false, // Use via search/curation, respect ToS
    notes: 'Largest verified trade show calendar, UFI member. Use as discovery layer, always verify via official site link.',
  },
  {
    id: 'tradefairdates',
    name: 'TradeFairDates (m+a ExpoDataBase)',
    baseUrl: 'https://www.tradefairdates.com',
    calendarUrl: 'https://www.tradefairdates.com/Fairs/search.php',
    type: 'ufi_certified_aggregator',
    trustScore: 9,
    coverage: ['global'],
    apiAvailable: false,
    scrapingAllowed: true,
    notes: 'German m+a Verlag, UFI partner, very accurate dates/venues. Secondary verification source.',
  },
  {
    id: 'expodatabase',
    name: 'ExpoDataBase (m+a)',
    baseUrl: 'https://www.expodatabase.com',
    calendarUrl: 'https://www.expodatabase.com/exhibitions',
    type: 'ufi_certified_aggregator',
    trustScore: 9,
    coverage: ['global'],
    scrapingAllowed: true,
    notes: 'Same publisher as TradeFairDates, structured data.',
  },
  {
    id: 'eventseye',
    name: 'EventsEye',
    baseUrl: 'https://www.eventseye.com',
    calendarUrl: 'https://www.eventseye.com/fairs/c1_trade-shows.html',
    type: 'ufi_certified_aggregator',
    trustScore: 8,
    coverage: ['global'],
    scrapingAllowed: true,
    notes: 'Curated trade show directory, good for cross-checking dates.',
  },
  {
    id: 'ufi',
    name: 'UFI - Global Association of Exhibition Industry',
    baseUrl: 'https://www.ufi.org',
    calendarUrl: 'https://www.ufi.org/members/',
    type: 'government',
    trustScore: 10,
    coverage: ['global'],
    notes: 'Not a calendar itself, but validates which shows/venues are UFI-approved. Use to flag verified shows.',
  },
  {
    id: 'auma',
    name: 'AUMA - Association of German Trade Fair Industry',
    baseUrl: 'https://www.auma.de',
    calendarUrl: 'https://www.auma.de/en/exhibit/find-exhibitions',
    type: 'government',
    trustScore: 10,
    coverage: ['Germany', 'global'],
    notes: 'Gold standard for German fairs (Frankfurt, Munich, Berlin, Cologne, Hannover, etc.). Official dates.',
  },
  // === OFFICIAL VENUE SOURCES (Priority 1 - Ground Truth) ===
  {
    id: 'messe-frankfurt',
    name: 'Messe Frankfurt',
    baseUrl: 'https://www.messefrankfurt.com',
    calendarUrl: 'https://www.messefrankfurt.com/frankfurt/en/events.html',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['Germany'],
    scrapingAllowed: true,
    notes: 'Ground truth for Frankfurt fairs (Automechanika, Ambiente, Light+Building)',
  },
  {
    id: 'messe-muenchen',
    name: 'Messe München',
    baseUrl: 'https://messe-muenchen.de',
    calendarUrl: 'https://messe-muenchen.de/en/events/',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['Germany'],
    scrapingAllowed: true,
    notes: 'BAU, ISPO, Automatica ground truth',
  },
  {
    id: 'messe-berlin',
    name: 'Messe Berlin',
    baseUrl: 'https://www.messe-berlin.de',
    calendarUrl: 'https://www.messe-berlin.de/en/events/',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['Germany'],
    notes: 'ITB Berlin, IFA ground truth',
  },
  {
    id: 'koelnmesse',
    name: 'Koelnmesse',
    baseUrl: 'https://www.koelnmesse.com',
    calendarUrl: 'https://www.koelnmesse.com/events/',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['Germany'],
    notes: 'Anuga, gamescom, IDS Cologne',
  },
  {
    id: 'dwtc',
    name: 'Dubai World Trade Centre',
    baseUrl: 'https://www.dwtc.com',
    calendarUrl: 'https://www.dwtc.com/en/events-calendar/',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['United Arab Emirates'],
    notes: 'GITEX, Arab Health ground truth',
  },
  {
    id: 'fira-barcelona',
    name: 'Fira Barcelona',
    baseUrl: 'https://www.firabarcelona.com',
    calendarUrl: 'https://www.firabarcelona.com/en/events-calendar',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['Spain'],
    notes: 'MWC Barcelona ground truth',
  },
  {
    id: 'javits',
    name: 'Javits Center New York',
    baseUrl: 'https://www.javitscenter.com',
    calendarUrl: 'https://www.javitscenter.com/events/',
    type: 'official_venue',
    trustScore: 10,
    coverage: ['United States'],
    notes: 'NYC ground truth',
  },
  {
    id: 'ces',
    name: 'CES - Consumer Technology Association',
    baseUrl: 'https://www.ces.tech',
    calendarUrl: 'https://www.ces.tech/',
    type: 'official_organizer',
    trustScore: 10,
    coverage: ['United States'],
    notes: 'Official CES site',
  },
  {
    id: 'canton-fair',
    name: 'Canton Fair Official',
    baseUrl: 'https://www.cantonfair.org.cn',
    calendarUrl: 'https://www.cantonfair.org.cn/en/',
    type: 'official_organizer',
    trustScore: 10,
    coverage: ['China'],
    notes: 'China Import and Export Fair',
  },
  {
    id: 'informa',
    name: 'Informa Markets',
    baseUrl: 'https://www.informa.com',
    calendarUrl: 'https://www.informa.com/events/',
    type: 'official_organizer',
    trustScore: 9,
    coverage: ['global'],
    notes: 'Arab Health, many global shows',
  },
];

export const getSourcesByCountry = (countryName: string): TrustworthySource[] => {
  return TRUSTWORTHY_SOURCES.filter(
    s => s.coverage.includes('global') || s.coverage.includes(countryName)
  ).sort((a, b) => b.trustScore - a.trustScore);
};

export const getOfficialVenueSources = (): TrustworthySource[] => {
  return TRUSTWORTHY_SOURCES.filter(s => s.type === 'official_venue' || s.type === 'official_organizer');
};

export const getAggregatorSources = (): TrustworthySource[] => {
  return TRUSTWORTHY_SOURCES.filter(s => s.type === 'ufi_certified_aggregator');
};
