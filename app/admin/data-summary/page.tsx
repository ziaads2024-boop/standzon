"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Building2, 
  Globe2, 
  Star, 
  Phone, 
  Mail, 
  ExternalLink, 
  Search, 
  Filter, 
  Download,
  SortAsc,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Database,
  CheckCircle,
  AlertCircle,
  Crown,
  Play,
  Zap,
  Target,
  Sparkles,
  Flag,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import { getAllExpandedCities } from '@/lib/data/expandedLocations';
import { dataPublishingService, PublishingTask } from '@/lib/services/dataPublishingService';
import { getCityPageUrl } from '@/lib/utils/slugUtils';
import { useToast } from '@/hooks/use-toast';

interface SummaryData {
  totalCountries: number;
  totalCities: number;
  completedCountries: number;
  completedCities: number;
  missingCountries: Array<{
    id: string;
    name: string;
    slug: string;
    continent: string;
    priority: string;
    annualEvents: number;
  }>;
  missingCities: Array<{
    id: string;
    name: string;
    country: string;
    continent: string;
    priority: string;
    annualEvents: number;
  }>;
  completionRate: number;
  publishingTasks: PublishingTask[];
}

export default function DataSummaryPage() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterContinent, setFilterContinent] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  // Load comprehensive summary data
  const loadSummaryData = async () => {
    setIsLoading(true);

    try {
      const allCountries = GLOBAL_EXHIBITION_DATA.countries;
      const allCities = getAllExpandedCities();
      
      // Simulate existing pages
      const existingPages = [
        '/exhibition-stands/germany/berlin',
        '/exhibition-stands/germany',
        '/exhibition-stands/united-arab-emirates/dubai',
        '/exhibition-stands/united-arab-emirates',
        '/exhibition-stands/united-states/las-vegas',
        '/exhibition-stands/united-states',
        '/exhibition-stands/france',
        '/exhibition-stands/china/shanghai',
        '/exhibition-stands/china'
      ];

      // Calculate missing countries
      const missingCountries = allCountries
        .filter(country => !existingPages.includes(`/exhibition-stands/${country.slug}`))
        .map(country => ({
          id: country.id,
          name: country.name,
          slug: country.slug,
          continent: country.continent,
          priority: country.exhibitionRanking <= 5 ? 'high' : country.exhibitionRanking <= 15 ? 'medium' : 'low',
          annualEvents: country.annualEvents
        }));

      // Calculate missing cities
      const missingCities = allCities
        .filter(city => !existingPages.includes(getCityPageUrl(city.country, city.name)))
        .map(city => ({
          id: city.id,
          name: city.name,
          country: city.country,
          continent: city.continent,
          priority: city.annualEvents >= 300 ? 'high' : city.annualEvents >= 100 ? 'medium' : 'low',
          annualEvents: city.annualEvents
        }));

      // Get publishing tasks
      const publishingTasks = await dataPublishingService.analyzeMissingData();

      const completedCountries = allCountries.length - missingCountries.length;
      const completedCities = allCities.length - missingCities.length;
      const totalItems = allCountries.length + allCities.length;
      const completedItems = completedCountries + completedCities;
      const completionRate = (completedItems / totalItems) * 100;

      const summaryData: SummaryData = {
        totalCountries: allCountries.length,
        totalCities: allCities.length,
        completedCountries,
        completedCities,
        missingCountries,
        missingCities,
        completionRate,
        publishingTasks
      };

      setSummaryData(summaryData);

    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Failed to load summary data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start bulk publishing
  const startBulkPublishing = async (items: Array<{ type: 'country' | 'city', id: string, name: string }>) => {
    setIsPublishing(true);

    try {
      const tasks: PublishingTask[] = items.map(item => ({
        id: `${item.type}-${item.id}`,
        type: item.type,
        slug: item.id,
        name: item.name,
        priority: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString()
      }));

      await dataPublishingService.addToQueue(tasks);
      
      toast({
        title: "Publishing Started",
        description: `Started publishing ${items.length} pages. Check the queue for progress.`,
      });

      // Refresh data after a delay
      setTimeout(() => {
        loadSummaryData();
      }, 2000);

    } catch (error) {
      toast({
        title: "Publishing Failed",
        description: "Failed to start bulk publishing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Filter and sort missing data
  const filteredMissingCountries = useMemo(() => {
    if (!summaryData) return [];
    
    let filtered = summaryData.missingCountries;

    // Apply filters
    if (searchQuery) {
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.continent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterContinent !== 'all') {
      filtered = filtered.filter(country => country.continent === filterContinent);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(country => country.priority === filterPriority);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'continent':
          return a.continent.localeCompare(b.continent);
        case 'events':
          return b.annualEvents - a.annualEvents;
        case 'priority':
        default:
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }
    });
  }, [summaryData, searchQuery, filterContinent, filterPriority, sortBy]);

  const filteredMissingCities = useMemo(() => {
    if (!summaryData) return [];
    
    let filtered = summaryData.missingCities;

    // Apply filters
    if (searchQuery) {
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.continent.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterContinent !== 'all') {
      filtered = filtered.filter(city => city.continent === filterContinent);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(city => city.priority === filterPriority);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'continent':
          return a.continent.localeCompare(b.continent);
        case 'events':
          return b.annualEvents - a.annualEvents;
        case 'priority':
        default:
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }
    });
  }, [summaryData, searchQuery, filterContinent, filterPriority, sortBy]);

  // Initial load
  useEffect(() => {
    loadSummaryData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <h3 className="text-lg font-medium">Loading Comprehensive Data Summary...</h3>
            <p className="text-gray-600">Analyzing global exhibition data completeness</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* page main content here, no Navigation/Footer */}
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Complete Data Summary
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mt-4">
              Comprehensive analysis of global exhibition stands data completeness
            </p>
            
            {summaryData && (
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{summaryData.completionRate.toFixed(1)}%</div>
                  <div className="text-blue-200">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{summaryData.missingCountries.length + summaryData.missingCities.length}</div>
                  <div className="text-blue-200">Missing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{summaryData.totalCountries + summaryData.totalCities}</div>
                  <div className="text-blue-200">Total</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Data Management Dashboard</h2>
              <p className="text-gray-600">Complete overview and bulk operations for global exhibition data</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={loadSummaryData} variant="outline" className="text-gray-900">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {summaryData && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="missing">Missing Data</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="publishing">Publishing Queue</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Pages</p>
                          <p className="text-3xl font-bold text-blue-800">
                            {summaryData.totalCountries + summaryData.totalCities}
                          </p>
                          <Progress value={summaryData.completionRate} className="mt-2" />
                        </div>
                        <Database className="h-12 w-12 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Completed</p>
                          <p className="text-3xl font-bold text-green-800">
                            {summaryData.completedCountries + summaryData.completedCities}
                          </p>
                          <p className="text-xs text-green-600">
                            {summaryData.completedCountries} countries, {summaryData.completedCities} cities
                          </p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Missing</p>
                          <p className="text-3xl font-bold text-orange-800">
                            {summaryData.missingCountries.length + summaryData.missingCities.length}
                          </p>
                          <p className="text-xs text-orange-600">
                            {summaryData.missingCountries.length} countries, {summaryData.missingCities.length} cities
                          </p>
                        </div>
                        <AlertCircle className="h-12 w-12 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Queue Status</p>
                          <p className="text-3xl font-bold text-purple-800">
                            {summaryData.publishingTasks.length}
                          </p>
                          <p className="text-xs text-purple-600">
                            Tasks ready to publish
                          </p>
                        </div>
                        <Activity className="h-12 w-12 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4 transition-transform" />
                      <h3 className="font-semibold mb-2">Publish Priority Countries</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Publish {summaryData.missingCountries.filter(c => c.priority === 'high').length} high-priority countries
                      </p>
                      <Button 
                        onClick={() => startBulkPublishing(
                          summaryData.missingCountries
                            .filter(c => c.priority === 'high')
                            .map(c => ({ type: 'country' as const, id: c.id, name: c.name }))
                        )}
                        className="w-full"
                        disabled={isPublishing}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Publishing
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4 transition-transform" />
                      <h3 className="font-semibold mb-2">Publish Top Cities</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Publish {summaryData.missingCities.filter(c => c.priority === 'high').length} major exhibition cities
                      </p>
                      <Button 
                        onClick={() => startBulkPublishing(
                          summaryData.missingCities
                            .filter(c => c.priority === 'high')
                            .slice(0, 20)
                            .map(c => ({ type: 'city', id: c.id, name: c.name }))
                        )}
                        className="w-full"
                        variant="outline"
                        disabled={isPublishing}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Start Publishing
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4 transition-transform" />
                      <h3 className="font-semibold mb-2">Smart Batch Publish</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Automatically select and publish optimal batch
                      </p>
                      <Button 
                        onClick={() => startBulkPublishing([
                          ...summaryData.missingCountries.filter(c => c.priority === 'high').slice(0, 10).map(c => ({ type: 'country' as const, id: c.id, name: c.name })),
                          ...summaryData.missingCities.filter(c => c.priority === 'high').slice(0, 30).map(c => ({ type: 'city' as const, id: c.id, name: c.name }))
                        ])}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        disabled={isPublishing}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Smart Publish
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Missing Data Tab */}
              <TabsContent value="missing" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters & Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search locations..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      <Select value={filterContinent} onValueChange={setFilterContinent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Continent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Continents</SelectItem>
                          <SelectItem value="Europe">Europe</SelectItem>
                          <SelectItem value="Asia">Asia</SelectItem>
                          <SelectItem value="North America">North America</SelectItem>
                          <SelectItem value="South America">South America</SelectItem>
                          <SelectItem value="Africa">Africa</SelectItem>
                          <SelectItem value="Oceania">Oceania</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="continent">Continent</SelectItem>
                          <SelectItem value="events">Annual Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Missing Countries */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Flag className="h-5 w-5 mr-2" />
                          Missing Countries
                        </span>
                        <Badge className="bg-red-100 text-red-800">
                          {filteredMissingCountries.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {filteredMissingCountries.map((country) => (
                            <div key={country.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <span className="font-medium">{country.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{country.continent}</Badge>
                                  <Badge 
                                    className={`text-xs ${
                                      country.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      country.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {country.priority}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{country.annualEvents} events</span>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Missing Cities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <MapPin className="h-5 w-5 mr-2" />
                          Missing Cities
                        </span>
                        <Badge className="bg-red-100 text-red-800">
                          {filteredMissingCities.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {filteredMissingCities.map((city) => (
                            <div key={city.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <span className="font-medium">{city.name}</span>
                                <p className="text-xs text-gray-500">{city.country}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{city.continent}</Badge>
                                  <Badge 
                                    className={`text-xs ${
                                      city.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      city.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {city.priority}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{city.annualEvents} events</span>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Other tabs would go here... */}
              <TabsContent value="completed" className="space-y-6">
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Completed Pages</h3>
                  <p className="text-gray-600">
                    {summaryData.completedCountries + summaryData.completedCities} pages are live and published
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="publishing" className="space-y-6">
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Publishing Queue</h3>
                  <p className="text-gray-600">
                    {summaryData.publishingTasks.length} tasks ready for automated publishing
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h3>
                  <p className="text-gray-600">
                    Detailed analytics coming soon
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </>
  );
}
