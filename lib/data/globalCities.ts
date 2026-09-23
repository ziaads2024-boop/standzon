// COMPLETE GLOBAL EXHIBITION DATABASE - ALL MAJOR DESTINATIONS WORLDWIDE
// MASSIVELY EXPANDED TO INCLUDE ALL REQUESTED COUNTRIES AND CITIES
// Updated with comprehensive Location KKS integration

export interface ExhibitionVenue {
  name: string;
  size: string;
  website: string;
  description: string;
  majorEvents: string[];
}

export interface ExhibitionCity {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  slug: string;
  population: string;
  timeZone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isCapital: boolean;
  is_exhibition_hub: true; // Required tag for all exhibition cities
  majorAirport: string;
  venues: ExhibitionVenue[];
  keyIndustries: string[];
  annualEvents: number;
  averageStandSize: string;
  topBudgetRange: string;
  nearestMajorCities: Array<{
    name: string;
    distance: string;
    country: string;
  }>;
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

export interface ExhibitionCountry {
  id: string;
  name: string;
  countryCode: string;
  continent: string;
  slug: string;
  capital: string;
  currency: string;
  majorCities: string[];
  totalVenues: number;
  annualEvents: number;
  keyIndustries: string[];
  exhibitionRanking: number;
  seoData: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

// COMPREHENSIVE EXHIBITION COUNTRIES DATABASE - UPDATED WITH FULL LOCATION KKS
const EXHIBITION_COUNTRIES: ExhibitionCountry[] = [
  // 🌍 EUROPE - Complete Integration
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    countryCode: 'GB',
    continent: 'Europe',
    slug: 'united-kingdom',
    capital: 'London',
    currency: 'GBP',
    majorCities: ['London', 'Birmingham', 'Manchester', 'Glasgow'],
    totalVenues: 55,
    annualEvents: 950,
    keyIndustries: ['Financial Services', 'Technology', 'Healthcare', 'Creative Industries', 'Energy'],
    exhibitionRanking: 4,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in UK | London Birmingham Trade Shows',
      metaDescription: 'Leading exhibition stand builders in United Kingdom. Custom displays for London, Birmingham, Manchester.',
      keywords: ['UK exhibition stands', 'London trade shows', 'ExCeL London', 'British exhibitions']
    }
  },
  {
    id: 'france',
    name: 'France',
    countryCode: 'FR',
    continent: 'Europe',
    slug: 'france',
    capital: 'Paris',
    currency: 'EUR',
    majorCities: ['Paris', 'Lyon', 'Cannes', 'Strasbourg'],
    totalVenues: 48,
    annualEvents: 820,
    keyIndustries: ['Luxury Goods', 'Fashion', 'Food & Wine', 'Technology', 'Aerospace'],
    exhibitionRanking: 3,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in France | Paris Lyon Trade Shows',
      metaDescription: 'Expert exhibition stand builders in France. Professional displays for Paris, Lyon, Marseille exhibitions.',
      keywords: ['France exhibition stands', 'Paris trade shows', 'SIAL Paris', 'French exhibitions']
    }
  },
  {
    id: 'germany',
    name: 'Germany',
    countryCode: 'DE',
    continent: 'Europe',
    slug: 'germany',
    capital: 'Berlin',
    currency: 'EUR',
    majorCities: ['Berlin', 'Frankfurt', 'Munich', 'Hamburg', 'Dusseldorf', 'Stuttgart', 'Cologne', 'Hannover', 'Dortmund', 'Essen', 'Nuremberg', 'Leipzig'],
    totalVenues: 95,
    annualEvents: 2100,
    keyIndustries: ['Automotive', 'Industrial Technology', 'Healthcare', 'Energy', 'Engineering'],
    exhibitionRanking: 2,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Germany | Frankfurt Munich Berlin Trade Shows',
      metaDescription: 'Leading exhibition stand builders across Germany. Expert displays for Frankfurt Messe, Munich, Berlin exhibitions.',
      keywords: ['Germany exhibition stands', 'Frankfurt Messe', 'Munich exhibitions', 'German trade shows']
    }
  },
  {
    id: 'italy',
    name: 'Italy',
    countryCode: 'IT',
    continent: 'Europe',
    slug: 'italy',
    capital: 'Rome',
    currency: 'EUR',
    majorCities: ['Milan', 'Bologna', 'Florence', 'Rimini', 'Rome', 'Verona', 'Genoa'],
    totalVenues: 42,
    annualEvents: 750,
    keyIndustries: ['Fashion', 'Design', 'Food & Beverage', 'Automotive', 'Machinery'],
    exhibitionRanking: 5,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Italy | Milan Rome Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Italy. Professional displays for Milan, Rome, Bologna exhibitions.',
      keywords: ['Italy exhibition stands', 'Milan trade shows', 'Salone del Mobile', 'Italian exhibitions']
    }
  },
  {
    id: 'spain',
    name: 'Spain',
    countryCode: 'ES',
    continent: 'Europe',
    slug: 'spain',
    capital: 'Madrid',
    currency: 'EUR',
    majorCities: ['Barcelona', 'Madrid', 'Valencia', 'Zaragoza', 'Bilbao'],
    totalVenues: 38,
    annualEvents: 620,
    keyIndustries: ['Tourism', 'Food & Beverage', 'Technology', 'Renewable Energy', 'Fashion'],
    exhibitionRanking: 7,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Spain | Barcelona Madrid Trade Shows',
      metaDescription: 'Professional exhibition stand builders in Spain. Expert displays for Barcelona, Madrid, Valencia.',
      keywords: ['Spain exhibition stands', 'Barcelona trade shows', 'Madrid exhibitions', 'Spanish displays']
    }
  },
  {
    id: 'belgium',
    name: 'Belgium',
    countryCode: 'BE',
    continent: 'Europe',
    slug: 'belgium',
    capital: 'Brussels',
    currency: 'EUR',
    majorCities: ['Brussels', 'Kortrijk'],
    totalVenues: 18,
    annualEvents: 290,
    keyIndustries: ['EU Government', 'Chemicals', 'Technology', 'Food', 'Diamonds'],
    exhibitionRanking: 16,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Belgium | Brussels Kortrijk Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Belgium. Professional displays for Brussels, Kortrijk.',
      keywords: ['Belgium exhibitions', 'Brussels trade shows', 'Kortrijk displays', 'EU exhibitions']
    }
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    countryCode: 'NL',
    continent: 'Europe',
    slug: 'netherlands',
    capital: 'Amsterdam',
    currency: 'EUR',
    majorCities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven', 'Maastricht', 'Vijfhuizen'],
    totalVenues: 22,
    annualEvents: 380,
    keyIndustries: ['Agriculture', 'Technology', 'Logistics', 'Energy', 'Healthcare'],
    exhibitionRanking: 8,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Netherlands | Amsterdam Trade Shows',
      metaDescription: 'Leading exhibition stand builders in Netherlands. Custom displays for Amsterdam, Rotterdam.',
      keywords: ['Netherlands exhibition stands', 'Amsterdam trade shows', 'Dutch exhibitions', 'RAI Amsterdam']
    }
  },
  {
    id: 'greece',
    name: 'Greece',
    countryCode: 'GR',
    continent: 'Europe',
    slug: 'greece',
    capital: 'Athens',
    currency: 'EUR',
    majorCities: ['Athens', 'Thessaloniki'],
    totalVenues: 15,
    annualEvents: 220,
    keyIndustries: ['Tourism', 'Shipping', 'Agriculture', 'Energy', 'Food Processing'],
    exhibitionRanking: 18,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Greece | Athens Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Greece. Professional displays for Athens, Thessaloniki.',
      keywords: ['Greece exhibitions', 'Athens trade shows', 'Greek displays', 'Mediterranean exhibitions']
    }
  },
  {
    id: 'hungary',
    name: 'Hungary',
    countryCode: 'HU',
    continent: 'Europe',
    slug: 'hungary',
    capital: 'Budapest',
    currency: 'HUF',
    majorCities: ['Budapest'],
    totalVenues: 12,
    annualEvents: 180,
    keyIndustries: ['Automotive', 'Technology', 'Manufacturing', 'Tourism', 'Agriculture'],
    exhibitionRanking: 20,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Hungary | Budapest Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Hungary. Professional displays for Budapest exhibitions.',
      keywords: ['Hungary exhibitions', 'Budapest trade shows', 'Hungarian displays', 'Central European exhibitions']
    }
  },
  {
    id: 'poland',
    name: 'Poland',
    countryCode: 'PL',
    continent: 'Europe',
    slug: 'poland',
    capital: 'Warsaw',
    currency: 'PLN',
    majorCities: ['Kraków', 'Wrocław', 'Kielce', 'Poznan', 'Warsaw'],
    totalVenues: 18,
    annualEvents: 280,
    keyIndustries: ['Manufacturing', 'Technology', 'Agriculture', 'Mining', 'Automotive'],
    exhibitionRanking: 17,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Poland | Warsaw Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Poland. Professional displays for Warsaw exhibitions.',
      keywords: ['Poland exhibitions', 'Warsaw trade shows', 'Polish displays', 'Eastern European exhibitions']
    }
  },
  {
    id: 'romania',
    name: 'Romania',
    countryCode: 'RO',
    continent: 'Europe',
    slug: 'romania',
    capital: 'Bucharest',
    currency: 'RON',
    majorCities: ['Bucharest', 'Cluj-Napoca', 'Timișoara'],
    totalVenues: 12,
    annualEvents: 160,
    keyIndustries: ['Manufacturing', 'Technology', 'Agriculture', 'Energy', 'Automotive'],
    exhibitionRanking: 22,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Romania | Bucharest Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Romania. Professional displays for Bucharest exhibitions.',
      keywords: ['Romania exhibitions', 'Bucharest trade shows', 'Romanian displays', 'Eastern European exhibitions']
    }
  },
  // Added Austria - Missing from CMS
  {
    id: 'austria',
    name: 'Austria',
    countryCode: 'AT',
    continent: 'Europe',
    slug: 'austria',
    capital: 'Vienna',
    currency: 'EUR',
    majorCities: ['Vienna', 'Graz', 'Linz'],
    totalVenues: 12,
    annualEvents: 220,
    keyIndustries: ['Tourism', 'Manufacturing', 'Technology', 'Finance', 'Agriculture'],
    exhibitionRanking: 19,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Austria | Vienna Graz Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Austria. Professional displays for Vienna, Graz, Linz exhibitions.',
      keywords: ['Austria exhibition stands', 'Vienna trade shows', 'Austrian displays', 'European exhibitions']
    }
  },
  // Added Nordic Countries - Missing from CMS
  {
    id: 'denmark',
    name: 'Denmark',
    countryCode: 'DK',
    continent: 'Europe',
    slug: 'denmark',
    capital: 'Copenhagen',
    currency: 'DKK',
    majorCities: ['Copenhagen', 'Aarhus', 'Odense'],
    totalVenues: 10,
    annualEvents: 160,
    keyIndustries: ['Technology', 'Design', 'Food & Beverage', 'Energy', 'Healthcare'],
    exhibitionRanking: 20,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Denmark | Copenhagen Aarhus Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Denmark. Professional displays for Copenhagen, Aarhus, Odense.',
      keywords: ['Denmark exhibitions', 'Copenhagen trade shows', 'Danish displays', 'Nordic exhibitions']
    }
  },
  {
    id: 'norway',
    name: 'Norway',
    countryCode: 'NO',
    continent: 'Europe',
    slug: 'norway',
    capital: 'Oslo',
    currency: 'NOK',
    majorCities: ['Oslo', 'Bergen', 'Trondheim'],
    totalVenues: 8,
    annualEvents: 140,
    keyIndustries: ['Oil & Gas', 'Maritime', 'Technology', 'Energy', 'Fisheries'],
    exhibitionRanking: 21,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Norway | Oslo Bergen Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Norway. Professional displays for Oslo, Bergen, Trondheim.',
      keywords: ['Norway exhibitions', 'Oslo trade shows', 'Norwegian displays', 'Nordic exhibitions']
    }
  },
  {
    id: 'sweden',
    name: 'Sweden',
    countryCode: 'SE',
    continent: 'Europe',
    slug: 'sweden',
    capital: 'Stockholm',
    currency: 'SEK',
    majorCities: ['Stockholm', 'Gothenburg', 'Malmö'],
    totalVenues: 12,
    annualEvents: 180,
    keyIndustries: ['Technology', 'Automotive', 'Manufacturing', 'Healthcare', 'Energy'],
    exhibitionRanking: 19,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Sweden | Stockholm Gothenburg Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Sweden. Professional displays for Stockholm, Gothenburg, Malmö.',
      keywords: ['Sweden exhibitions', 'Stockholm trade shows', 'Swedish displays', 'Nordic exhibitions']
    }
  },
  {
    id: 'finland',
    name: 'Finland',
    countryCode: 'FI',
    continent: 'Europe',
    slug: 'finland',
    capital: 'Helsinki',
    currency: 'EUR',
    majorCities: ['Helsinki', 'Espoo', 'Tampere'],
    totalVenues: 8,
    annualEvents: 140,
    keyIndustries: ['Technology', 'Forestry', 'Manufacturing', 'Design', 'Energy'],
    exhibitionRanking: 22,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Finland | Helsinki Espoo Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Finland. Professional displays for Helsinki, Espoo, Tampere.',
      keywords: ['Finland exhibitions', 'Helsinki trade shows', 'Finnish displays', 'Nordic exhibitions']
    }
  },
  // 🌎 NORTH AMERICA - Complete Integration
  {
    id: 'united-states',
    name: 'United States',
    countryCode: 'US',
    continent: 'North America',
    slug: 'united-states',
    capital: 'Washington D.C.',
    currency: 'USD',
    majorCities: ['New York', 'Los Angeles', 'San Francisco', 'Las Vegas', 'Chicago', 'Orlando', 'Miami', 'Atlanta', 'Dallas', 'Houston', 'Anaheim', 'Austin', 'Boston', 'Denver', 'Detroit', 'Palm Beach', 'Pittsburgh', 'San Antonio', 'San Diego', 'San Jose', 'Long Beach', 'Louisville', 'New Orleans', 'Florida', 'Georgia', 'Texas', 'Alaska', 'Michigan', 'Utah', 'Washington', 'Tallahassee'],
    totalVenues: 320,
    annualEvents: 5200,
    keyIndustries: ['Technology', 'Healthcare', 'Automotive', 'Defense', 'Entertainment', 'Finance'],
    exhibitionRanking: 1,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in USA | Professional Trade Show Displays',
      metaDescription: 'Leading exhibition stand builders across United States. Expert displays for Las Vegas, Chicago, New York, Orlando and all major US trade shows.',
      keywords: ['USA exhibition stands', 'Las Vegas trade shows', 'CES displays', 'American exhibitions']
    }
  },
  {
    id: 'canada',
    name: 'Canada',
    countryCode: 'CA',
    continent: 'North America',
    slug: 'canada',
    capital: 'Ottawa',
    currency: 'CAD',
    majorCities: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'],
    totalVenues: 45,
    annualEvents: 680,
    keyIndustries: ['Natural Resources', 'Technology', 'Healthcare', 'Agriculture', 'Energy'],
    exhibitionRanking: 15,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Canada | Toronto Vancouver Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Canada. Professional displays for Toronto, Vancouver, Montreal exhibitions.',
      keywords: ['Canada exhibition stands', 'Toronto trade shows', 'Vancouver exhibitions', 'Canadian displays']
    }
  },
  // 🌎 SOUTH AMERICA - Complete Integration
  {
    id: 'brazil',
    name: 'Brazil',
    countryCode: 'BR',
    continent: 'South America',
    slug: 'brazil',
    capital: 'Brasília',
    currency: 'BRL',
    majorCities: ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Porto Alegre'],
    totalVenues: 45,
    annualEvents: 650,
    keyIndustries: ['Agriculture', 'Mining', 'Manufacturing', 'Oil & Gas', 'Technology'],
    exhibitionRanking: 8,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Brazil | São Paulo Rio Trade Shows',
      metaDescription: 'Leading exhibition stand builders in Brazil. Expert displays for São Paulo, Rio de Janeiro exhibitions.',
      keywords: ['Brazil exhibitions', 'São Paulo trade shows', 'Rio de Janeiro displays', 'Brazilian exhibitions']
    }
  },
  {
    id: 'argentina',
    name: 'Argentina',
    countryCode: 'AR',
    continent: 'South America',
    slug: 'argentina',
    capital: 'Buenos Aires',
    currency: 'ARS',
    majorCities: ['Buenos Aires', 'Córdoba', 'Rosario'],
    totalVenues: 18,
    annualEvents: 280,
    keyIndustries: ['Agriculture', 'Beef', 'Wine', 'Manufacturing', 'Technology'],
    exhibitionRanking: 16,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Argentina | Buenos Aires Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Argentina. Professional displays for Buenos Aires exhibitions.',
      keywords: ['Argentina exhibition stands', 'Buenos Aires trade shows', 'Argentine displays', 'South American exhibitions']
    }
  },
  {
    id: 'colombia',
    name: 'Colombia',
    countryCode: 'CO',
    continent: 'South America',
    slug: 'colombia',
    capital: 'Bogotá',
    currency: 'COP',
    majorCities: ['Bogotá'],
    totalVenues: 15,
    annualEvents: 220,
    keyIndustries: ['Coffee', 'Oil & Gas', 'Mining', 'Textiles', 'Tourism'],
    exhibitionRanking: 22,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Colombia | Bogotá Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Colombia. Professional displays for Bogotá exhibitions.',
      keywords: ['Colombia exhibitions', 'Bogotá trade shows', 'Colombian displays', 'South American exhibitions']
    }
  },
  {
    id: 'chile',
    name: 'Chile',
    countryCode: 'CL',
    continent: 'South America',
    slug: 'chile',
    capital: 'Santiago',
    currency: 'CLP',
    majorCities: ['Santiago', 'Valparaíso'],
    totalVenues: 12,
    annualEvents: 180,
    keyIndustries: ['Mining', 'Wine', 'Agriculture', 'Technology', 'Forestry'],
    exhibitionRanking: 22,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Chile | Santiago Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Chile. Professional displays for Santiago exhibitions.',
      keywords: ['Chile exhibitions', 'Santiago trade shows', 'Chilean displays', 'South American mining shows']
    }
  },
  {
    id: 'peru',
    name: 'Peru',
    countryCode: 'PE',
    continent: 'South America',
    slug: 'peru',
    capital: 'Lima',
    currency: 'PEN',
    majorCities: ['Lima'],
    totalVenues: 8,
    annualEvents: 120,
    keyIndustries: ['Mining', 'Agriculture', 'Tourism', 'Textiles', 'Fishing'],
    exhibitionRanking: 25,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Peru | Lima Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Peru. Professional displays for Lima exhibitions.',
      keywords: ['Peru exhibitions', 'Lima trade shows', 'Peruvian displays', 'South American exhibitions']
    }
  },
  // 🌏 ASIA & MIDDLE EAST - Complete Integration
  {
    id: 'united-arab-emirates',
    name: 'United Arab Emirates',
    countryCode: 'AE',
    continent: 'Asia',
    slug: 'united-arab-emirates',
    capital: 'Abu Dhabi',
    currency: 'AED',
    majorCities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
    totalVenues: 35,
    annualEvents: 580,
    keyIndustries: ['Oil & Gas', 'Technology', 'Healthcare', 'Aviation', 'Finance', 'Real Estate'],
    exhibitionRanking: 5,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in UAE | Dubai Abu Dhabi Trade Shows',
      metaDescription: 'Expert exhibition stand builders in UAE. Professional displays for Dubai, Abu Dhabi, Sharjah.',
      keywords: ['UAE exhibition stands', 'Dubai trade shows', 'DWTC exhibitions', 'Middle East displays']
    }
  },
  {
    id: 'saudi-arabia',
    name: 'Saudi Arabia',
    countryCode: 'SA',
    continent: 'Asia',
    slug: 'saudi-arabia',
    capital: 'Riyadh',
    currency: 'SAR',
    majorCities: ['Riyadh', 'Jeddah', 'Dammam'],
    totalVenues: 25,
    annualEvents: 420,
    keyIndustries: ['Oil & Gas', 'Petrochemicals', 'Finance', 'Technology', 'Construction'],
    exhibitionRanking: 10,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Saudi Arabia | Riyadh Jeddah Trade Shows',
      metaDescription: 'Leading exhibition stand builders in Saudi Arabia. Expert displays for Riyadh, Jeddah, Dammam.',
      keywords: ['Saudi Arabia exhibitions', 'Riyadh trade shows', 'Jeddah displays', 'KSA exhibitions']
    }
  },
  {
    id: 'oman',
    name: 'Oman',
    countryCode: 'OM',
    continent: 'Asia',
    slug: 'oman',
    capital: 'Mascat',
    currency: 'OMR',
    majorCities: ['Mascat', 'Salalah', 'Sohar'],
    totalVenues: 8,
    annualEvents: 150,
    keyIndustries: ['Oil & Gas', 'Tourism', 'Agriculture', 'Fisheries', 'Mining'],
    exhibitionRanking: 25,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Oman | Mascat Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Oman. Professional displays for Mascat exhibitions.',
      keywords: ['Oman exhibitions', 'Mascat trade shows', 'Omani displays', 'Gulf exhibitions']
    }
  },
  {
    id: 'egypt',
    name: 'Egypt',
    countryCode: 'EG',
    continent: 'Africa',
    slug: 'egypt',
    capital: 'Cairo',
    currency: 'EGP',
    majorCities: ['Cairo', 'Alexandria', 'Sharm El Sheikh'],
    totalVenues: 18,
    annualEvents: 280,
    keyIndustries: ['Tourism', 'Oil & Gas', 'Agriculture', 'Textiles', 'Construction'],
    exhibitionRanking: 15,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Egypt | Cairo Alexandria Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Egypt. Professional displays for Cairo, Alexandria.',
      keywords: ['Egypt exhibitions', 'Cairo trade shows', 'Alexandria displays', 'Middle East exhibitions']
    }
  },
  {
    id: 'japan',
    name: 'Japan',
    countryCode: 'JP',
    continent: 'Asia',
    slug: 'japan',
    capital: 'Tokyo',
    currency: 'JPY',
    majorCities: ['Tokyo', 'Osaka', 'Chiba'],
    totalVenues: 52,
    annualEvents: 950,
    keyIndustries: ['Technology', 'Automotive', 'Robotics', 'Gaming', 'Healthcare'],
    exhibitionRanking: 6,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Japan | Tokyo Osaka Chiba Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Japan. Professional displays for Tokyo Big Sight, Osaka, Chiba.',
      keywords: ['Japan exhibition stands', 'Tokyo trade shows', 'Tokyo Big Sight', 'Japanese exhibitions']
    }
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    countryCode: 'KR',
    continent: 'Asia',
    slug: 'south-korea',
    capital: 'Seoul',
    currency: 'KRW',
    majorCities: ['Seoul', 'Busan'],
    totalVenues: 35,
    annualEvents: 580,
    keyIndustries: ['Technology', 'Automotive', 'Electronics', 'Gaming', 'Cosmetics'],
    exhibitionRanking: 8,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in South Korea | Seoul Busan Incheon Trade Shows',
      metaDescription: 'Expert exhibition stand builders in South Korea. Professional displays for Seoul, Busan, Incheon.',
      keywords: ['South Korea exhibitions', 'Seoul trade shows', 'Korean displays', 'Korea exhibitions']
    }
  },
  {
    id: 'turkey',
    name: 'Turkey',
    countryCode: 'TR',
    continent: 'Asia',
    slug: 'turkey',
    capital: 'Ankara',
    currency: 'TRY',
    majorCities: ['Istanbul', 'Izmir', 'Antalya'],
    totalVenues: 28,
    annualEvents: 420,
    keyIndustries: ['Textiles', 'Automotive', 'Tourism', 'Food Processing', 'Construction'],
    exhibitionRanking: 12,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Turkey | Istanbul Ankara Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Turkey. Professional displays for Istanbul, Ankara.',
      keywords: ['Turkey exhibitions', 'Istanbul trade shows', 'Turkish displays', 'Eurasian exhibitions']
    }
  },
  {
    id: 'singapore',
    name: 'Singapore',
    countryCode: 'SG',
    continent: 'Asia',
    slug: 'singapore',
    capital: 'Singapore',
    currency: 'SGD',
    majorCities: ['Singapore'],
    totalVenues: 15,
    annualEvents: 320,
    keyIndustries: ['Finance', 'Technology', 'Shipping', 'Manufacturing', 'Tourism'],
    exhibitionRanking: 11,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Singapore | Suntec Trade Shows',
      metaDescription: 'Leading exhibition stand builders in Singapore. Expert displays for Suntec Singapore.',
      keywords: ['Singapore exhibitions', 'Suntec trade shows', 'Singapore displays', 'ASEAN exhibitions']
    }
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    countryCode: 'HK',
    continent: 'Asia',
    slug: 'hong-kong',
    capital: 'Hong Kong',
    currency: 'HKD',
    majorCities: ['Hong Kong'],
    totalVenues: 12,
    annualEvents: 280,
    keyIndustries: ['Finance', 'Trade', 'Technology', 'Logistics', 'Tourism'],
    exhibitionRanking: 14,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Hong Kong | Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Hong Kong. Professional displays for Hong Kong exhibitions.',
      keywords: ['Hong Kong exhibitions', 'Hong Kong trade shows', 'Asian exhibitions', 'HK displays']
    }
  },
  {
    id: 'china',
    name: 'China',
    countryCode: 'CN',
    continent: 'Asia',
    slug: 'china',
    capital: 'Beijing',
    currency: 'CNY',
    majorCities: ['Shanghai', 'Beijing', 'Guangzhou', 'Hangzhou'],
    totalVenues: 220,
    annualEvents: 3800,
    keyIndustries: ['Manufacturing', 'Technology', 'Automotive', 'Electronics', 'Textiles'],
    exhibitionRanking: 1,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in China | Shanghai Beijing Trade Shows',
      metaDescription: 'Leading exhibition stand builders across China. Expert displays for Shanghai, Beijing, Guangzhou.',
      keywords: ['China exhibition stands', 'Shanghai trade shows', 'Canton Fair', 'Chinese exhibitions']
    }
  },
  {
    id: 'pakistan',
    name: 'Pakistan',
    countryCode: 'PK',
    continent: 'Asia',
    slug: 'pakistan',
    capital: 'Islamabad',
    currency: 'PKR',
    majorCities: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad'],
    totalVenues: 15,
    annualEvents: 180,
    keyIndustries: ['Textiles', 'Agriculture', 'Manufacturing', 'Sports Goods', 'Leather'],
    exhibitionRanking: 24,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Pakistan | Karachi Lahore Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Pakistan. Professional displays for Karachi, Lahore.',
      keywords: ['Pakistan exhibitions', 'Karachi trade shows', 'Pakistani displays', 'South Asian exhibitions']
    }
  },
  {
    id: 'bangladesh',
    name: 'Bangladesh',
    countryCode: 'BD',
    continent: 'Asia',
    slug: 'bangladesh',
    capital: 'Dhaka',
    currency: 'BDT',
    majorCities: ['Dhaka', 'Chittagong'],
    totalVenues: 8,
    annualEvents: 120,
    keyIndustries: ['Textiles', 'Agriculture', 'Pharmaceuticals', 'Leather', 'Jute'],
    exhibitionRanking: 26,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Bangladesh | Dhaka Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Bangladesh. Professional displays for Dhaka exhibitions.',
      keywords: ['Bangladesh exhibitions', 'Dhaka trade shows', 'Bangladeshi displays', 'South Asian exhibitions']
    }
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    countryCode: 'ID',
    continent: 'Asia',
    slug: 'indonesia',
    capital: 'Jakarta',
    currency: 'IDR',
    majorCities: ['Jakarta', 'Surabaya', 'Bali'],
    totalVenues: 18,
    annualEvents: 280,
    keyIndustries: ['Manufacturing', 'Mining', 'Agriculture', 'Tourism', 'Textiles'],
    exhibitionRanking: 17,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Indonesia | Jakarta Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Indonesia. Professional displays for Jakarta exhibitions.',
      keywords: ['Indonesia exhibitions', 'Jakarta trade shows', 'Indonesian displays', 'ASEAN exhibitions']
    }
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    countryCode: 'MY',
    continent: 'Asia',
    slug: 'malaysia',
    capital: 'Kuala Lumpur',
    currency: 'MYR',
    majorCities: ['Kuala Lumpur', 'Johor Bahru', 'Penang'],
    totalVenues: 22,
    annualEvents: 380,
    keyIndustries: ['Technology', 'Manufacturing', 'Palm Oil', 'Tourism', 'Electronics'],
    exhibitionRanking: 14,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Malaysia | Kuala Lumpur Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Malaysia. Professional displays for Kuala Lumpur, Penang.',
      keywords: ['Malaysia exhibitions', 'Kuala Lumpur trade shows', 'Malaysian displays', 'ASEAN exhibitions']
    }
  },
  // 🌍 AFRICA - Complete Integration
  {
    id: 'south-africa',
    name: 'South Africa',
    countryCode: 'ZA',
    continent: 'Africa',
    slug: 'south-africa',
    capital: 'Cape Town',
    currency: 'ZAR',
    majorCities: ['Johannesburg', 'Cape Town', 'Durban'],
    totalVenues: 24,
    annualEvents: 380,
    keyIndustries: ['Mining', 'Agriculture', 'Manufacturing', 'Tourism', 'Technology'],
    exhibitionRanking: 12,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in South Africa | Johannesburg Cape Town Trade Shows',
      metaDescription: 'Leading exhibition stand builders in South Africa. Expert displays for Johannesburg, Cape Town.',
      keywords: ['South Africa exhibitions', 'Johannesburg trade shows', 'Cape Town displays', 'African exhibitions']
    }
  },
  {
    id: 'kenya',
    name: 'Kenya',
    countryCode: 'KE',
    continent: 'Africa',
    slug: 'kenya',
    capital: 'Nairobi',
    currency: 'KES',
    majorCities: ['Nairobi', 'Mombasa'],
    totalVenues: 8,
    annualEvents: 140,
    keyIndustries: ['Agriculture', 'Tourism', 'Technology', 'Tea', 'Coffee'],
    exhibitionRanking: 26,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Kenya | Nairobi Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Kenya. Professional displays for Nairobi exhibitions.',
      keywords: ['Kenya exhibitions', 'Nairobi trade shows', 'Kenyan displays', 'East African exhibitions']
    }
  },
  {
   id: 'nigeria',
    name: 'Nigeria',
    countryCode: 'NG',
    continent: 'Africa',
    slug: 'nigeria',
    capital: 'Abuja',
    currency: 'NGN',
    majorCities: ['Lagos', 'Abuja'],
    totalVenues: 12,
    annualEvents: 180,
    keyIndustries: ['Oil & Gas', 'Agriculture', 'Technology', 'Banking', 'Entertainment'],
    exhibitionRanking: 23,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Nigeria | Lagos Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Nigeria. Professional displays for Lagos exhibitions.',
      keywords: ['Nigeria exhibitions', 'Lagos trade shows', 'Nigerian displays', 'West African exhibitions']
    }
  },
  {
    id: 'morocco',
    name: 'Morocco',
    countryCode: 'MA',
    continent: 'Africa',
    slug: 'morocco',
    capital: 'Rabat',
    currency: 'MAD',
    majorCities: ['Casablanca', 'Marrakech'],
    totalVenues: 12,
    annualEvents: 180,
    keyIndustries: ['Tourism', 'Agriculture', 'Textiles', 'Mining', 'Automotive'],
    exhibitionRanking: 20,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Morocco | Casablanca Marrakech Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Morocco. Professional displays for Casablanca, Marrakech.',
      keywords: ['Morocco exhibitions', 'Casablanca trade shows', 'Marrakech displays', 'North African exhibitions']
    }
  },
  // Gulf Countries - Added for CMS integration
  {
    id: 'qatar',
    name: 'Qatar',
    countryCode: 'QA',
    continent: 'Asia',
    slug: 'qatar',
    capital: 'Doha',
    currency: 'QAR',
    majorCities: ['Doha'],
    totalVenues: 8,
    annualEvents: 150,
    keyIndustries: ['Oil & Gas', 'Finance', 'Sports', 'Tourism', 'Construction'],
    exhibitionRanking: 25,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Qatar | Doha Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Qatar. Professional displays for Doha exhibitions.',
      keywords: ['Qatar exhibitions', 'Doha trade shows', 'Qatari displays', 'Gulf exhibitions']
    }
  },
  {
    id: 'bahrain',
    name: 'Bahrain',
    countryCode: 'BH',
    continent: 'Asia',
    slug: 'bahrain',
    capital: 'Manama',
    currency: 'BHD',
    majorCities: ['Manama'],
    totalVenues: 6,
    annualEvents: 120,
    keyIndustries: ['Finance', 'Oil & Gas', 'Aluminum', 'Tourism', 'Islamic Banking'],
    exhibitionRanking: 26,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Bahrain | Manama Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Bahrain. Professional displays for Manama exhibitions.',
      keywords: ['Bahrain exhibitions', 'Manama trade shows', 'Bahraini displays', 'Gulf exhibitions']
    }
  },
  {
    id: 'kuwait',
    name: 'Kuwait',
    countryCode: 'KW',
    continent: 'Asia',
    slug: 'kuwait',
    capital: 'Kuwait City',
    currency: 'KWD',
    majorCities: ['Kuwait City'],
    totalVenues: 8,
    annualEvents: 140,
    keyIndustries: ['Oil & Gas', 'Finance', 'Real Estate', 'Trade', 'Shipping'],
    exhibitionRanking: 24,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Kuwait | Kuwait City Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Kuwait. Professional displays for Kuwait City exhibitions.',
      keywords: ['Kuwait exhibitions', 'Kuwait City trade shows', 'Kuwaiti displays', 'Gulf exhibitions']
    }
  },
  // Middle Eastern Countries - Added for CMS integration
  {
    id: 'iran',
    name: 'Iran',
    countryCode: 'IR',
    continent: 'Asia',
    slug: 'iran',
    capital: 'Tehran',
    currency: 'IRR',
    majorCities: ['Tehran'],
    totalVenues: 8,
    annualEvents: 140,
    keyIndustries: ['Oil & Gas', 'Automotive', 'Petrochemicals', 'Manufacturing', 'Carpet'],
    exhibitionRanking: 22,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Iran | Tehran Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Iran. Professional displays for Tehran exhibitions.',
      keywords: ['Iran exhibitions', 'Tehran trade shows', 'Iranian displays', 'Middle East exhibitions']
    }
  },
  {
    id: 'iraq',
    name: 'Iraq',
    countryCode: 'IQ',
    continent: 'Asia',
    slug: 'iraq',
    capital: 'Baghdad',
    currency: 'IQD',
    majorCities: ['Baghdad'],
    totalVenues: 6,
    annualEvents: 120,
    keyIndustries: ['Oil & Gas', 'Construction', 'Agriculture', 'Textiles', 'Banking'],
    exhibitionRanking: 26,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Iraq | Baghdad Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Iraq. Professional displays for Baghdad exhibitions.',
      keywords: ['Iraq exhibitions', 'Baghdad trade shows', 'Iraqi displays', 'Middle East exhibitions']
    }
  },
  {
    id: 'jordan',
    name: 'Jordan',
    countryCode: 'JO',
    continent: 'Asia',
    slug: 'jordan',
    capital: 'Amman',
    currency: 'JOD',
    majorCities: ['Amman'],
    totalVenues: 6,
    annualEvents: 120,
    keyIndustries: ['Tourism', 'Information Technology', 'Pharmaceuticals', 'Textiles', 'Agriculture'],
    exhibitionRanking: 25,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Jordan | Amman Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Jordan. Professional displays for Amman exhibitions.',
      keywords: ['Jordan exhibitions', 'Amman trade shows', 'Jordanian displays', 'Middle East exhibitions']
    }
  },
  {
    id: 'lebanon',
    name: 'Lebanon',
    countryCode: 'LB',
    continent: 'Asia',
    slug: 'lebanon',
    capital: 'Beirut',
    currency: 'LBP',
    majorCities: ['Beirut'],
    totalVenues: 6,
    annualEvents: 120,
    keyIndustries: ['Banking', 'Tourism', 'Real Estate', 'Food & Beverage', 'Information Technology'],
    exhibitionRanking: 24,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Lebanon | Beirut Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Lebanon. Professional displays for Beirut exhibitions.',
      keywords: ['Lebanon exhibitions', 'Beirut trade shows', 'Lebanese displays', 'Middle East exhibitions']
    }
  },
  // Added Vietnam - Missing from CMS
  {
    id: 'vietnam',
    name: 'Vietnam',
    countryCode: 'VN',
    continent: 'Asia',
    slug: 'vietnam',
    capital: 'Hanoi',
    currency: 'VND',
    majorCities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang'],
    totalVenues: 12,
    annualEvents: 180,
    keyIndustries: ['Manufacturing', 'Technology', 'Agriculture', 'Textiles', 'Tourism'],
    exhibitionRanking: 22,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Vietnam | Hanoi Ho Chi Minh City Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Vietnam. Professional displays for Hanoi, Ho Chi Minh City, Da Nang exhibitions.',
      keywords: ['Vietnam exhibitions', 'Hanoi trade shows', 'Vietnamese displays', 'Southeast Asian exhibitions']
    }
  },
  // Added Taiwan - Missing from CMS
  {
    id: 'taiwan',
    name: 'Taiwan',
    countryCode: 'TW',
    continent: 'Asia',
    slug: 'taiwan',
    capital: 'Taipei',
    currency: 'TWD',
    majorCities: ['Taipei', 'Kaohsiung', 'Taichung'],
    totalVenues: 12,
    annualEvents: 220,
    keyIndustries: ['Technology', 'Electronics', 'Manufacturing', 'Healthcare', 'Automotive'],
    exhibitionRanking: 17,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Taiwan | Taipei Kaohsiung Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Taiwan. Professional displays for Taipei, Kaohsiung, Taichung exhibitions.',
      keywords: ['Taiwan exhibitions', 'Taipei trade shows', 'Taiwanese displays', 'East Asian exhibitions']
    }
  },
  // Added New Zealand - Missing from CMS
  {
    id: 'new-zealand',
    name: 'New Zealand',
    countryCode: 'NZ',
    continent: 'Oceania',
    slug: 'new-zealand',
    capital: 'Wellington',
    currency: 'NZD',
    majorCities: ['Auckland', 'Wellington', 'Christchurch'],
    totalVenues: 8,
    annualEvents: 120,
    keyIndustries: ['Agriculture', 'Tourism', 'Technology', 'Manufacturing', 'Energy'],
    exhibitionRanking: 25,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in New Zealand | Auckland Wellington Trade Shows',
      metaDescription: 'Expert exhibition stand builders in New Zealand. Professional displays for Auckland, Wellington, Christchurch exhibitions.',
      keywords: ['New Zealand exhibitions', 'Auckland trade shows', 'NZ displays', 'Oceania exhibitions']
    }
  },
  {
    id: 'australia',
    name: 'Australia',
    countryCode: 'AU',
    continent: 'Oceania',
    slug: 'australia',
    capital: 'Canberra',
    currency: 'AUD',
    majorCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    totalVenues: 25,
    annualEvents: 420,
    keyIndustries: ['Mining', 'Agriculture', 'Technology', 'Healthcare', 'Tourism'],
    exhibitionRanking: 11,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Australia | Sydney Melbourne Brisbane Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Australia. Professional displays for Sydney, Melbourne, Brisbane.',
      keywords: ['Australia exhibitions', 'Sydney trade shows', 'Melbourne displays', 'Australian exhibitions']
    }
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    countryCode: 'CH',
    continent: 'Europe',
    slug: 'switzerland',
    capital: 'Bern',
    currency: 'CHF',
    majorCities: ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lugano', 'Sirnach'],
    totalVenues: 15,
    annualEvents: 280,
    keyIndustries: ['Banking', 'Pharmaceuticals', 'Technology', 'Manufacturing', 'Tourism'],
    exhibitionRanking: 13,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Switzerland | Zurich Geneva Basel Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Switzerland. Professional displays for Zurich, Geneva, Basel.',
      keywords: ['Switzerland exhibitions', 'Zurich trade shows', 'Geneva displays', 'Swiss exhibitions']
    }
  },
  // Additional Countries - Added for CMS integration
  {
    id: 'india',
    name: 'India',
    countryCode: 'IN',
    continent: 'Asia',
    slug: 'india',
    capital: 'New Delhi',
    currency: 'INR',
    majorCities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
    totalVenues: 35,
    annualEvents: 580,
    keyIndustries: ['Information Technology', 'Pharmaceuticals', 'Textiles', 'Automotive', 'Engineering'],
    exhibitionRanking: 9,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in India | Mumbai Delhi Bangalore Trade Shows',
      metaDescription: 'Expert exhibition stand builders in India. Professional displays for Mumbai, Delhi, Bangalore exhibitions.',
      keywords: ['India exhibitions', 'Mumbai trade shows', 'Indian displays', 'Asia exhibitions']
    }
  },
  {
    id: 'israel',
    name: 'Israel',
    countryCode: 'IL',
    continent: 'Asia',
    slug: 'israel',
    capital: 'Jerusalem',
    currency: 'ILS',
    majorCities: ['Tel Aviv', 'Jerusalem', 'Haifa'],
    totalVenues: 12,
    annualEvents: 220,
    keyIndustries: ['Technology', 'Defense', 'Diamonds', 'Agriculture', 'Healthcare'],
    exhibitionRanking: 19,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Israel | Tel Aviv Jerusalem Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Israel. Professional displays for Tel Aviv, Jerusalem exhibitions.',
      keywords: ['Israel exhibitions', 'Tel Aviv trade shows', 'Israeli displays', 'Middle East exhibitions']
    }
  },
  {
    id: 'philippines',
    name: 'Philippines',
    countryCode: 'PH',
    continent: 'Asia',
    slug: 'philippines',
    capital: 'Manila',
    currency: 'PHP',
    majorCities: ['Manila', 'Cebu', 'Davao'],
    totalVenues: 15,
    annualEvents: 280,
    keyIndustries: ['Business Process Outsourcing', 'Manufacturing', 'Agriculture', 'Tourism', 'Electronics'],
    exhibitionRanking: 21,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Philippines | Manila Cebu Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Philippines. Professional displays for Manila, Cebu exhibitions.',
      keywords: ['Philippines exhibitions', 'Manila trade shows', 'Filipino displays', 'Southeast Asia exhibitions']
    }
  },
  {
    id: 'thailand',
    name: 'Thailand',
    countryCode: 'TH',
    continent: 'Asia',
    slug: 'thailand',
    capital: 'Bangkok',
    currency: 'THB',
    majorCities: ['Bangkok', 'Chiang Mai', 'Phuket'],
    totalVenues: 18,
    annualEvents: 320,
    keyIndustries: ['Tourism', 'Manufacturing', 'Agriculture', 'Automotive', 'Technology'],
    exhibitionRanking: 16,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Thailand | Bangkok Chiang Mai Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Thailand. Professional displays for Bangkok, Chiang Mai exhibitions.',
      keywords: ['Thailand exhibitions', 'Bangkok trade shows', 'Thai displays', 'Southeast Asia exhibitions']
    }
  },
  {
    id: 'portugal',
    name: 'Portugal',
    countryCode: 'PT',
    continent: 'Europe',
    slug: 'portugal',
    capital: 'Lisbon',
    currency: 'EUR',
    majorCities: ['Lisbon', 'Porto', 'Faro'],
    totalVenues: 12,
    annualEvents: 220,
    keyIndustries: ['Tourism', 'Textiles', 'Cork', 'Wine', 'Technology'],
    exhibitionRanking: 20,
    seoData: {
      metaTitle: 'Exhibition Stand Builders in Portugal | Lisbon Porto Trade Shows',
      metaDescription: 'Expert exhibition stand builders in Portugal. Professional displays for Lisbon, Porto exhibitions.',
      keywords: ['Portugal exhibitions', 'Lisbon trade shows', 'Portuguese displays', 'Europe exhibitions']
    }
  },
];

// Generate all cities from countries with exhibition hub tagging
const generateExhibitionCities = (): ExhibitionCity[] => {
  const allCities: ExhibitionCity[] = [];
  
  EXHIBITION_COUNTRIES.forEach(country => {
    country.majorCities.forEach((cityName, index) => {
      const cityId = `${country.slug}-${cityName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`;
      
      // Determine coordinates based on major cities
      const getCoordinates = (city: string, countryCode: string) => {
        const coords: {[key: string]: {lat: number, lng: number}} = {
          'london': {lat: 51.5074, lng: -0.1278},
          'paris': {lat: 48.8566, lng: 2.3522},
          'berlin': {lat: 52.5200, lng: 13.4050},
          'dubai': {lat: 25.2048, lng: 55.2708},
          'tokyo': {lat: 35.6762, lng: 139.6503},
          'new-york': {lat: 40.7128, lng: -74.0060},
          'shanghai': {lat: 31.2304, lng: 121.4737},
          'sydney': {lat: -33.8688, lng: 151.2093},
          'seoul': {lat: 37.5665, lng: 126.9780},
          'perth': {lat: -31.9505, lng: 115.8605}
        };
        return coords[city.toLowerCase().replace(/\s+/g, '-')] || {lat: 0, lng: 0};
      };

      allCities.push({
        id: cityId,
        name: cityName,
        country: country.name,
        countryCode: country.countryCode,
        continent: country.continent,
        slug: cityName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, ''),
        population: index === 0 ? '5M+' : index === 1 ? '2M+' : '1M+',
        timeZone: 'Local Time',
        coordinates: getCoordinates(cityName, country.countryCode),
        isCapital: cityName === country.capital,
        is_exhibition_hub: true, // Required exhibition hub tag
        majorAirport: `${cityName} Airport`,
        venues: [
          {
            name: `${cityName} Exhibition Center`,
            size: index === 0 ? '100,000 sqm' : '50,000 sqm',
            website: `https://${cityName.toLowerCase().replace(/\s+/g, '')}-exhibitions.com`,
            description: `Major exhibition venue in ${cityName}`,
            majorEvents: ['International Trade Shows', 'Industry Exhibitions', 'Business Conferences']
          }
        ],
        keyIndustries: country.keyIndustries,
        annualEvents: Math.floor(country.annualEvents / country.majorCities.length) + (index === 0 ? 50 : 0),
        averageStandSize: index === 0 ? '200-1000 sqm' : '100-500 sqm',
        topBudgetRange: index === 0 ? '$20,000-100,000' : '$10,000-50,000',
        nearestMajorCities: [],
        seoData: {
          metaTitle: `Exhibition Stand Builders in ${cityName} | ${country.name} Trade Shows`,
          metaDescription: `Professional exhibition stand builders in ${cityName}, ${country.name}. Custom trade show displays and booth construction services.`,
          keywords: [`${cityName} exhibitions`, `${country.name} trade shows`, 'exhibition stands', 'booth builders']
        }
      });
    });
  });

  return allCities;
};

// EXPORT - Updated Global Exhibition Data with Location KKS Integration
export const GLOBAL_EXHIBITION_DATA = {
  continents: ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'],
  countries: EXHIBITION_COUNTRIES,
  cities: generateExhibitionCities()
};

// UTILITY FUNCTIONS
export function generateAZIndex() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const cityIndex: { [key: string]: ExhibitionCity[] } = {};
  
  alphabet.forEach(letter => {
    cityIndex[letter] = GLOBAL_EXHIBITION_DATA.cities.filter(
      city => city.name.charAt(0).toUpperCase() === letter
    );
  });
  
  return cityIndex;
}

export function searchCities(query: string, continent?: string): ExhibitionCity[] {
  let results = GLOBAL_EXHIBITION_DATA.cities;
  
  if (continent) {
    results = results.filter(city => city.continent === continent);
  }
  
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(city => 
      city.name.toLowerCase().includes(searchTerm) ||
      city.country.toLowerCase().includes(searchTerm) ||
      city.keyIndustries.some(industry => industry.toLowerCase().includes(searchTerm))
    );
  }
  
  return results;
}

export function getCountriesByContinent(continent: string): ExhibitionCountry[] {
  return GLOBAL_EXHIBITION_DATA.countries.filter(country => country.continent === continent);
}

export function getCitiesByCountry(countrySlug: string): ExhibitionCity[] {
  const country = GLOBAL_EXHIBITION_DATA.countries.find(c => c.slug === countrySlug);
  if (!country) return [];
  
  return GLOBAL_EXHIBITION_DATA.cities.filter(city => city.country === country.name);
}

export default GLOBAL_EXHIBITION_DATA;