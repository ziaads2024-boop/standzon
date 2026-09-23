export type Continent = {
icon: string;
countries: { name: string; flag: string; cities: string[]; builders: number; rating: number; projects: number; href: string }[];
interlinkingCountries: string[];
};

export const CONTINENTS: Record<string, Continent> = {
'North America': {
  icon: '🌎',
  countries: [
    { name: 'United States', flag: '🇺🇸', cities: ['New York', 'Las Vegas', 'Chicago', 'Miami', 'Atlanta', 'Los Angeles', 'Boston', 'Detroit'], builders: 145, rating: 4.8, projects: 500, href: '/exhibition-stands/united-states' },
    { name: 'Canada', flag: '🇨🇦', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'], builders: 45, rating: 4.7, projects: 200, href: '/exhibition-stands/canada' },
    { name: 'Mexico', flag: '🇲🇽', cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'], builders: 35, rating: 4.6, projects: 150, href: '/exhibition-stands/mexico' }
  ],
  interlinkingCountries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Costa Rica', 'Panama', 'Guatemala', 'Ecuador']
},
'Europe': {
  icon: '🌍',
  countries: [
    { name: 'Germany', flag: '🇩🇪', cities: ['Berlin', 'Frankfurt', 'Munich', 'Hamburg', 'Cologne', 'Stuttgart', 'Dusseldorf'], builders: 180, rating: 4.9, projects: 750, href: '/exhibition-stands/germany' },
    { name: 'United Kingdom', flag: '🇬🇧', cities: ['London', 'Birmingham', 'Manchester', 'Edinburgh', 'Glasgow', 'Leeds'], builders: 120, rating: 4.8, projects: 400, href: '/exhibition-stands/united-kingdom' },
    { name: 'France', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Bordeaux'], builders: 95, rating: 4.7, projects: 350, href: '/exhibition-stands/france' },
    { name: 'Italy', flag: '🇮🇹', cities: ['Milan', 'Rome', 'Bologna', 'Turin', 'Florence', 'Venice'], builders: 85, rating: 4.6, projects: 280, href: '/exhibition-stands/italy' },
    { name: 'Spain', flag: '🇪🇸', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'], builders: 78, rating: 4.5, projects: 240, href: '/exhibition-stands/spain' },
    { name: 'Netherlands', flag: '🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'], builders: 65, rating: 4.8, projects: 200, href: '/exhibition-stands/netherlands' }
  ],
  interlinkingCountries: ['Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Portugal', 'Greece', 'Turkey']
},
'Asia Pacific': {
  icon: '🌏',
  countries: [
    { name: 'China', flag: '🇨🇳', cities: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou'], builders: 250, rating: 4.7, projects: 600, href: '/exhibition-stands/china' },
    { name: 'Japan', flag: '🇯🇵', cities: ['Tokyo', 'Osaka', 'Chiba'], builders: 140, rating: 4.8, projects: 450, href: '/exhibition-stands/japan' },
    { name: 'Singapore', flag: '🇸🇬', cities: ['Singapore'], builders: 55, rating: 4.9, projects: 200, href: '/exhibition-stands/singapore' },
    { name: 'India', flag: '🇮🇳', cities: ['Mumbai', 'New Delhi', 'Bangalore', 'Hyderabad', 'Kolkata'], builders: 180, rating: 4.6, projects: 350, href: '/exhibition-stands/india' },
    { name: 'South Korea', flag: '🇰🇷', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu'], builders: 95, rating: 4.7, projects: 280, href: '/exhibition-stands/south-korea' }
  ],
  interlinkingCountries: ['Australia', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Taiwan', 'Hong Kong', 'New Zealand']
},
'Middle East': {
  icon: '🏛️',
  countries: [
    { name: 'United Arab Emirates', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'], builders: 120, rating: 4.8, projects: 400, href: '/exhibition-stands/united-arab-emirates' },
    { name: 'Saudi Arabia', flag: '🇸🇦', cities: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca', 'Medina'], builders: 85, rating: 4.7, projects: 300, href: '/exhibition-stands/saudi-arabia' },
    { name: 'Qatar', flag: '🇶🇦', cities: ['Doha', 'Al Rayyan', 'Al Wakrah'], builders: 45, rating: 4.6, projects: 150, href: '/exhibition-stands/qatar' },
    { name: 'Kuwait', flag: '🇰🇼', cities: ['Kuwait City', 'Al Ahmadi', 'Hawalli'], builders: 35, rating: 4.5, projects: 120, href: '/exhibition-stands/kuwait' },
    { name: 'Oman', flag: '🇴🇲', cities: ['Mascat', 'Salalah', 'Sohar'], builders: 28, rating: 4.4, projects: 90, href: '/exhibition-stands/oman' }
  ],
  interlinkingCountries: ['Bahrain', 'Jordan', 'Lebanon', 'Egypt', 'Israel', 'Iran', 'Iraq']
}
};
