import { GLOBAL_EXHIBITION_DATA, type ExhibitionCountry, type ExhibitionCity } from '@/lib/data/globalCities';
import { getCityPageUrl, getCountryPageUrl } from '@/lib/utils/slugUtils';

export interface LocationSelection {
  continent?: string;
  country?: string;
  city?: string;
  countryCode?: string;
}

export interface LocationOption {
  value: string;
  label: string;
  data?: any;
}

// Enhanced interface for GMB API integration
export interface ExhibitionHubLocation {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  is_exhibition_hub: boolean;
  coordinates: { lat: number; lng: number };
  annualEvents: number;
  keyIndustries: string[];
  gmbSearchTerms?: string[]; // For GMB API queries
}

export class GlobalLocationManager {
  
  // Get all continents
  static getContinents(): LocationOption[] {
    return GLOBAL_EXHIBITION_DATA.continents.map(continent => ({
      value: continent.toLowerCase().replace(/\s+/g, '-'),
      label: continent,
      data: { type: 'continent', name: continent }
    }));
  }

  // Get countries by continent
  static getCountriesByContinent(continent?: string): LocationOption[] {
    let countries = GLOBAL_EXHIBITION_DATA.countries;
    
    if (continent) {
      const continentName = continent.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      countries = countries.filter(country => country.continent === continentName);
    }
    
    return countries
      .sort((a, b) => a.exhibitionRanking - b.exhibitionRanking)
      .map(country => ({
        value: country.slug,
        label: country.name,
        data: { 
          type: 'country',
          countryCode: country.countryCode,
          continent: country.continent,
          exhibitionRanking: country.exhibitionRanking,
          annualEvents: country.annualEvents,
          totalVenues: country.totalVenues
        }
      }));
  }

  // Get cities by country
  static getCitiesByCountry(countrySlug?: string): LocationOption[] {
    let cities = GLOBAL_EXHIBITION_DATA.cities;
    
    if (countrySlug) {
      const country = GLOBAL_EXHIBITION_DATA.countries.find(c => c.slug === countrySlug);
      if (country) {
        cities = cities.filter(city => city.country === country.name);
      }
    }
    
    return cities
      .sort((a, b) => b.annualEvents - a.annualEvents)
      .map(city => ({
        value: city.slug,
        label: city.name,
        data: {
          type: 'city',
          country: city.country,
          countryCode: city.countryCode,
          continent: city.continent,
          isCapital: city.isCapital,
          is_exhibition_hub: city.is_exhibition_hub,
          population: city.population,
          venues: city.venues.length,
          annualEvents: city.annualEvents,
          coordinates: city.coordinates
        }
      }));
  }

  // Get all exhibition hub cities (for GMB API integration)
  static getAllExhibitionHubs(): ExhibitionHubLocation[] {
    console.log('🎯 Loading all exhibition hub locations for GMB API integration...');
    
    const exhibitionHubs = GLOBAL_EXHIBITION_DATA.cities
      .filter(city => city.is_exhibition_hub)
      .map(city => ({
        id: city.id,
        name: city.name,
        country: city.country,
        countryCode: city.countryCode,
        continent: city.continent,
        is_exhibition_hub: city.is_exhibition_hub,
        coordinates: city.coordinates,
        annualEvents: city.annualEvents,
        keyIndustries: city.keyIndustries,
        gmbSearchTerms: [
          `exhibition stand builders ${city.name}`,
          `trade show displays ${city.name}`,
          `booth construction ${city.name}`,
          `event displays ${city.country}`,
          ...city.keyIndustries.map(industry => `${industry} exhibitions ${city.name}`)
        ]
      }));

    console.log(`📍 Loaded ${exhibitionHubs.length} exhibition hub locations across ${GLOBAL_EXHIBITION_DATA.continents.length} continents`);
    return exhibitionHubs;
  }

  // Get exhibition hubs by continent (for regional GMB searches)
  static getExhibitionHubsByContinent(continent: string): ExhibitionHubLocation[] {
    console.log(`🌍 Loading exhibition hubs for ${continent}...`);
    
    const hubs = this.getAllExhibitionHubs().filter(hub => 
      hub.continent.toLowerCase() === continent.toLowerCase()
    );
    
    console.log(`📊 Found ${hubs.length} exhibition hubs in ${continent}`);
    return hubs;
  }

  // Get exhibition hubs by country (for country-specific GMB searches)
  static getExhibitionHubsByCountry(countryCode: string): ExhibitionHubLocation[] {
    console.log(`🏳️ Loading exhibition hubs for ${countryCode}...`);
    
    const hubs = this.getAllExhibitionHubs().filter(hub => 
      hub.countryCode.toLowerCase() === countryCode.toLowerCase()
    );
    
    console.log(`📊 Found ${hubs.length} exhibition hubs in ${countryCode}`);
    return hubs;
  }

  // Get top exhibition destinations by annual events (for priority GMB searches)
  static getTopExhibitionHubs(limit: number = 50): ExhibitionHubLocation[] {
    console.log(`🔝 Loading top ${limit} exhibition hubs by annual events...`);
    
    const topHubs = this.getAllExhibitionHubs()
      .sort((a, b) => b.annualEvents - a.annualEvents)
      .slice(0, limit);
    
    console.log(`🎯 Top exhibition hubs loaded for priority GMB searches`);
    return topHubs;
  }

  // Generate GMB search queries for a specific location
  static generateGMBSearchQueries(location: ExhibitionHubLocation): string[] {
    const baseQueries = [
      `exhibition stand builders ${location.name}`,
      `trade show displays ${location.name}`,
      `booth construction ${location.name}`,
      `exhibition contractors ${location.name}`,
      `display companies ${location.name}`,
      `trade show services ${location.country}`,
      `exhibition design ${location.name}`,
      `event displays ${location.name}`
    ];

    // Add industry-specific queries
    const industryQueries = location.keyIndustries.slice(0, 3).map(industry => 
      `${industry.toLowerCase()} exhibition builders ${location.name}`
    );

    return [...baseQueries, ...industryQueries];
  }

  // Get comprehensive location statistics for admin dashboard
  static getLocationKKSStatistics() {
    const stats = {
      totalContinents: GLOBAL_EXHIBITION_DATA.continents.length,
      totalCountries: GLOBAL_EXHIBITION_DATA.countries.length,
      totalExhibitionHubs: GLOBAL_EXHIBITION_DATA.cities.filter(c => c.is_exhibition_hub).length,
      totalAnnualEvents: GLOBAL_EXHIBITION_DATA.cities.reduce((sum, city) => sum + city.annualEvents, 0),
      continentBreakdown: {} as {[key: string]: {countries: number, cities: number, events: number}},
      topCountriesByEvents: GLOBAL_EXHIBITION_DATA.countries
        .sort((a, b) => b.annualEvents - a.annualEvents)
        .slice(0, 10)
        .map(country => ({
          name: country.name,
          code: country.countryCode,
          events: country.annualEvents,
          cities: country.majorCities.length
        })),
      topCitiesByEvents: GLOBAL_EXHIBITION_DATA.cities
        .sort((a, b) => b.annualEvents - a.annualEvents)
        .slice(0, 20)
        .map(city => ({
          name: city.name,
          country: city.country,
          events: city.annualEvents,
          isHub: city.is_exhibition_hub
        }))
    };

    // Calculate continent breakdown
    GLOBAL_EXHIBITION_DATA.continents.forEach(continent => {
      const continentCountries = GLOBAL_EXHIBITION_DATA.countries.filter(c => c.continent === continent);
      const continentCities = GLOBAL_EXHIBITION_DATA.cities.filter(c => c.continent === continent);
      const continentEvents = continentCities.reduce((sum, city) => sum + city.annualEvents, 0);
      
      stats.continentBreakdown[continent] = {
        countries: continentCountries.length,
        cities: continentCities.length,
        events: continentEvents
      };
    });

    console.log('📊 Location KKS Statistics:', stats);
    return stats;
  }

  // Search locations with exhibition hub priority
  static searchExhibitionLocations(query: string, limit: number = 10): LocationOption[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const results: LocationOption[] = [];

    // Search exhibition hub cities first (highest priority)
    const hubCities = GLOBAL_EXHIBITION_DATA.cities
      .filter(city => city.is_exhibition_hub)
      .filter(city =>
        city.name.toLowerCase().includes(searchTerm) ||
        city.country.toLowerCase().includes(searchTerm) ||
        city.keyIndustries.some(industry => industry.toLowerCase().includes(searchTerm))
      );

    hubCities.slice(0, limit).forEach(city => {
      results.push({
        value: `${city.slug}`,
        label: `${city.name}, ${city.country} (Exhibition Hub)`,
        data: {
          type: 'exhibition_hub',
          city: city.name,
          country: city.country,
          countryCode: city.countryCode,
          continent: city.continent,
          is_exhibition_hub: city.is_exhibition_hub,
          annualEvents: city.annualEvents,
          venues: city.venues.length,
          coordinates: city.coordinates
        }
      });
    });

    // Search countries if we have room
    if (results.length < limit) {
      const countries = GLOBAL_EXHIBITION_DATA.countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm) ||
        country.keyIndustries.some(industry => industry.toLowerCase().includes(searchTerm))
      );

      countries.slice(0, limit - results.length).forEach(country => {
        results.push({
          value: country.slug,
          label: `${country.name} (${country.majorCities.length} Exhibition Cities)`,
          data: {
            type: 'country',
            country: country.name,
            countryCode: country.countryCode,
            continent: country.continent,
            exhibitionRanking: country.exhibitionRanking,
            annualEvents: country.annualEvents,
            majorCities: country.majorCities.length
          }
        });
      });
    }

    return results;
  }

  // Get all countries (for dropdowns)
  static getAllCountries(): LocationOption[] {
    return GLOBAL_EXHIBITION_DATA.countries
      .sort((a, b) => a.exhibitionRanking - b.exhibitionRanking)
      .map(country => ({
        value: country.slug,
        label: country.name,
        data: { 
          countryCode: country.countryCode,
          continent: country.continent,
          exhibitionRanking: country.exhibitionRanking
        }
      }));
  }

  // Get all cities (for search/autocomplete)
  static getAllCities(): LocationOption[] {
    return GLOBAL_EXHIBITION_DATA.cities
      .sort((a, b) => b.annualEvents - a.annualEvents)
      .map(city => ({
        value: city.slug,
        label: `${city.name}, ${city.country}`,
        data: {
          city: city.name,
          country: city.country,
          countryCode: city.countryCode,
          continent: city.continent,
          annualEvents: city.annualEvents
        }
      }));
  }

  // Search locations by query
  static searchLocations(query: string, limit: number = 10): LocationOption[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const results: LocationOption[] = [];

    // Search cities first (most specific)
    const cities = GLOBAL_EXHIBITION_DATA.cities.filter(city =>
      city.name.toLowerCase().includes(searchTerm) ||
      city.country.toLowerCase().includes(searchTerm) ||
      city.keyIndustries.some(industry => industry.toLowerCase().includes(searchTerm))
    );

    cities.slice(0, limit).forEach(city => {
      results.push({
        value: `${city.slug}`,
        label: `${city.name}, ${city.country}`,
        data: {
          type: 'city',
          city: city.name,
          country: city.country,
          countryCode: city.countryCode,
          continent: city.continent,
          annualEvents: city.annualEvents,
          venues: city.venues.length
        }
      });
    });

    // Search countries if we have room
    if (results.length < limit) {
      const countries = GLOBAL_EXHIBITION_DATA.countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm) ||
        country.keyIndustries.some(industry => industry.toLowerCase().includes(searchTerm))
      );

      countries.slice(0, limit - results.length).forEach(country => {
        results.push({
          value: country.slug,
          label: country.name,
          data: {
            type: 'country',
            country: country.name,
            countryCode: country.countryCode,
            continent: country.continent,
            exhibitionRanking: country.exhibitionRanking,
            annualEvents: country.annualEvents
          }
        });
      });
    }

    return results;
  }

  // Get location details by slug/type
  static getLocationDetails(slug: string, type: 'country' | 'city'): ExhibitionCountry | ExhibitionCity | null {
    if (type === 'country') {
      return GLOBAL_EXHIBITION_DATA.countries.find(country => country.slug === slug) || null;
    } else {
      return GLOBAL_EXHIBITION_DATA.cities.find(city => city.slug === slug) || null;
    }
  }

  // Get top exhibition destinations
  static getTopExhibitionDestinations(limit: number = 20): LocationOption[] {
    return GLOBAL_EXHIBITION_DATA.cities
      .sort((a, b) => b.annualEvents - a.annualEvents)
      .slice(0, limit)
      .map(city => ({
        value: city.slug,
        label: `${city.name}, ${city.country}`,
        data: {
          city: city.name,
          country: city.country,
          countryCode: city.countryCode,
          continent: city.continent,
          annualEvents: city.annualEvents,
          venues: city.venues.length,
          averageStandSize: city.averageStandSize,
          topBudgetRange: city.topBudgetRange
        }
      }));
  }

  // Get countries by exhibition ranking
  static getTopExhibitionCountries(limit: number = 30): LocationOption[] {
    return GLOBAL_EXHIBITION_DATA.countries
      .sort((a, b) => a.exhibitionRanking - b.exhibitionRanking)
      .slice(0, limit)
      .map(country => ({
        value: country.slug,
        label: country.name,
        data: {
          countryCode: country.countryCode,
          continent: country.continent,
          exhibitionRanking: country.exhibitionRanking,
          annualEvents: country.annualEvents,
          totalVenues: country.totalVenues,
          keyIndustries: country.keyIndustries
        }
      }));
  }

  // Validate location path (for URL routing)
  static validateLocationPath(country?: string, city?: string): {
    isValid: boolean;
    countryData?: ExhibitionCountry;
    cityData?: ExhibitionCity;
    suggestions?: LocationOption[];
  } {
    let countryData: ExhibitionCountry | undefined;
    let cityData: ExhibitionCity | undefined;

    // Validate country
    if (country) {
      countryData = GLOBAL_EXHIBITION_DATA.countries.find(c => c.slug === country);
      if (!countryData) {
        return {
          isValid: false,
          suggestions: this.searchLocations(country, 5)
        };
      }
    }

    // Validate city
    if (city && countryData) {
      cityData = GLOBAL_EXHIBITION_DATA.cities.find(c => 
        c.slug === city && c.country === countryData!.name
      );
      if (!cityData) {
        return {
          isValid: false,
          countryData,
          suggestions: this.getCitiesByCountry(country).slice(0, 5)
        };
      }
    }

    return {
      isValid: true,
      countryData,
      cityData
    };
  }

  // Generate SEO-friendly URLs
  static generateLocationURL(country?: string, city?: string): string {
    if (city && country) {
      return getCityPageUrl(country, city);
    } else if (country) {
      return getCountryPageUrl(country);
    } else {
      return '/exhibition-stands';
    }
  }

  // Get builders count by location (mock data for now)
  static getBuildersCountByLocation(country?: string, city?: string): number {
    // This would typically query the builders database
    // For now, return mock data based on exhibition activity
    if (city) {
      const cityData = GLOBAL_EXHIBITION_DATA.cities.find(c => c.slug === city);
      if (cityData) {
        return Math.floor(cityData.annualEvents / 10) + Math.floor(Math.random() * 5);
      }
    }
    
    if (country) {
      const countryData = GLOBAL_EXHIBITION_DATA.countries.find(c => c.slug === country);
      if (countryData) {
        return Math.floor(countryData.annualEvents / 15) + Math.floor(Math.random() * 10);
      }
    }
    
    return 0;
  }

  // Get similar locations
  static getSimilarLocations(currentSlug: string, type: 'country' | 'city', limit: number = 5): LocationOption[] {
    const current = this.getLocationDetails(currentSlug, type);
    if (!current) return [];

    if (type === 'city') {
      const currentCity = current as ExhibitionCity;
      // Find cities in same country or similar size/activity
      return GLOBAL_EXHIBITION_DATA.cities
        .filter(city => 
          city.slug !== currentSlug &&
          (city.country === currentCity.country || 
           Math.abs(city.annualEvents - currentCity.annualEvents) < 100)
        )
        .sort((a, b) => Math.abs(a.annualEvents - currentCity.annualEvents) - Math.abs(b.annualEvents - currentCity.annualEvents))
        .slice(0, limit)
        .map(city => ({
          value: city.slug,
          label: `${city.name}, ${city.country}`,
          data: {
            city: city.name,
            country: city.country,
            annualEvents: city.annualEvents
          }
        }));
    } else {
      const currentCountry = current as ExhibitionCountry;
      // Find countries in same continent or similar ranking
      return GLOBAL_EXHIBITION_DATA.countries
        .filter(country => 
          country.slug !== currentSlug &&
          (country.continent === currentCountry.continent ||
           Math.abs(country.exhibitionRanking - currentCountry.exhibitionRanking) < 5)
        )
        .sort((a, b) => Math.abs(a.exhibitionRanking - currentCountry.exhibitionRanking) - Math.abs(b.exhibitionRanking - currentCountry.exhibitionRanking))
        .slice(0, limit)
        .map(country => ({
          value: country.slug,
          label: country.name,
          data: {
            country: country.name,
            continent: country.continent,
            exhibitionRanking: country.exhibitionRanking
          }
        }));
    }
  }
}

export default GlobalLocationManager;
