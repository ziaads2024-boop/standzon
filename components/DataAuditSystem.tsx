'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import { getAllExpandedCities, EXPANDED_LOCATION_STATS } from '@/lib/data/expandedLocations';
import { tier1Countries } from '@/lib/data/countries';
import {
  CheckCircle, AlertCircle, XCircle, Play, Pause, Database, 
  Globe, MapPin, Building2, TrendingUp, Clock, Zap, Target,
  RefreshCw, Eye, Edit, Plus, Download, Upload, Settings,
  BarChart3, PieChart, Activity, Loader2, CheckCheck,
  AlertTriangle, Map, Flag, Users, Calendar, Search,
  Filter, ArrowRight, ExternalLink, Crown, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCityPageUrl } from '@/lib/utils/slugUtils';

interface DataCompleteness {
  totalCountries: number;
  totalCities: number;
  completedCountries: number;
  completedCities: number;
  missingCountries: string[];
  missingCities: string[];
  completionRate: number;
  lastUpdate: string;
}

interface PublishingStatus {
  isRunning: boolean;
  currentItem: string | null;
  progress: number;
  queue: string[];
  completed: string[];
  errors: string[];
}

export default function DataAuditSystem() {
  const [auditData, setAuditData] = useState<DataCompleteness | null>(null);
  const [publishingStatus, setPublishingStatus] = useState<PublishingStatus>({
    isRunning: false,
    currentItem: null,
    progress: 0,
    queue: [],
    completed: [],
    errors: []
  });
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  console.log('DataAuditSystem state:', {
    auditData,
    publishingStatus,
    selectedContinent,
    searchQuery,
    activeTab
  });

  // Simulate existing pages (in real implementation, this would check filesystem)
  const getExistingPages = () => {
    const existing = [
      '/exhibition-stands/germany/berlin',
      '/exhibition-stands/germany',
      '/exhibition-stands/united-arab-emirates/dubai',
      '/exhibition-stands/united-arab-emirates',
      '/exhibition-stands/united-states/las-vegas',
      '/exhibition-stands/united-states',
      '/exhibition-stands/france',
    ];
    return existing;
  };

  // Perform comprehensive data audit
  const performDataAudit = async () => {
    setIsLoading(true);
    console.log('🔍 Starting comprehensive data audit...');

    try {
      // Get all data from sources
      const allCountries = GLOBAL_EXHIBITION_DATA.countries;
      const allCities = getAllExpandedCities();
      const existingPages = getExistingPages();

      console.log('📊 Data sources loaded:', {
        countries: allCountries.length,
        cities: allCities.length,
        existingPages: existingPages.length
      });

      // Analyze missing content
      const missingCountries: string[] = [];
      const missingCities: string[] = [];
      
      // Check countries
      allCountries.forEach(country => {
        const countryPath = `/exhibition-stands/${country.slug}`;
        if (!existingPages.includes(countryPath)) {
          missingCountries.push(country.slug);
        }
      });

      // Check cities
      allCities.forEach(city => {
        const cityPath = getCityPageUrl(city.country, city.name);
        if (!existingPages.includes(cityPath)) {
          missingCities.push(city.id);
        }
      });

      const completedCountries = allCountries.length - missingCountries.length;
      const completedCities = allCities.length - missingCities.length;
      const totalItems = allCountries.length + allCities.length;
      const completedItems = completedCountries + completedCities;
      const completionRate = (completedItems / totalItems) * 100;

      const auditResult: DataCompleteness = {
        totalCountries: allCountries.length,
        totalCities: allCities.length,
        completedCountries,
        completedCities,
        missingCountries,
        missingCities,
        completionRate,
        lastUpdate: new Date().toISOString()
      };

      console.log('✅ Data audit completed:', auditResult);
      setAuditData(auditResult);
      
      toast({
        title: "Data Audit Completed",
        description: `Found ${missingCountries.length + missingCities.length} missing pages out of ${totalItems} total items.`,
      });

    } catch (error) {
      console.error('❌ Data audit failed:', error);
      toast({
        title: "Audit Failed",
        description: "Failed to complete data audit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start automated publishing
  const startAutomatedPublishing = async (items: string[]) => {
    console.log('🚀 Starting automated publishing for:', items);
    
    setPublishingStatus({
      isRunning: true,
      currentItem: null,
      progress: 0,
      queue: [...items],
      completed: [],
      errors: []
    });

    toast({
      title: "Publishing Started",
      description: `Starting to publish ${items.length} missing pages...`,
    });

    // Simulate publishing process
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      setPublishingStatus(prev => ({
        ...prev,
        currentItem: item,
        progress: ((i + 1) / items.length) * 100
      }));

      try {
        // Simulate API call to create page
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          setPublishingStatus(prev => ({
            ...prev,
            completed: [...prev.completed, item],
            queue: prev.queue.filter(q => q !== item)
          }));
          console.log(`✅ Successfully published: ${item}`);
        } else {
          setPublishingStatus(prev => ({
            ...prev,
            errors: [...prev.errors, item],
            queue: prev.queue.filter(q => q !== item)
          }));
          console.log(`❌ Failed to publish: ${item}`);
        }
      } catch (error) {
        console.error(`❌ Error publishing ${item}:`, error);
        setPublishingStatus(prev => ({
          ...prev,
          errors: [...prev.errors, item],
          queue: prev.queue.filter(q => q !== item)
        }));
      }
    }

    setPublishingStatus(prev => ({
      ...prev,
      isRunning: false,
      currentItem: null
    }));

    toast({
      title: "Publishing Completed",
      description: `Published ${publishingStatus.completed.length} pages successfully.`,
    });

    // Refresh audit data
    await performDataAudit();
  };

  // Get filtered missing data
  const filteredMissingData = useMemo(() => {
    if (!auditData) return { countries: [], cities: [] };

    let filteredCountries = auditData.missingCountries;
    let filteredCities = auditData.missingCities;

    if (selectedContinent !== 'all') {
      const continentCountries = GLOBAL_EXHIBITION_DATA.countries
        .filter(c => c.continent === selectedContinent)
        .map(c => c.slug);
      
      filteredCountries = filteredCountries.filter(slug => 
        continentCountries.includes(slug)
      );

      const continentCities = getAllExpandedCities()
        .filter(c => c.continent === selectedContinent)
        .map(c => c.id);
      
      filteredCities = filteredCities.filter(id => 
        continentCities.includes(id)
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCountries = filteredCountries.filter(slug => 
        slug.toLowerCase().includes(query)
      );
      filteredCities = filteredCities.filter(id => 
        id.toLowerCase().includes(query)
      );
    }

    return { countries: filteredCountries, cities: filteredCities };
  }, [auditData, selectedContinent, searchQuery]);

  // Initial audit on component mount
  useEffect(() => {
    performDataAudit();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <h3 className="text-lg font-medium">Running Data Audit...</h3>
          <p className="text-gray-600">Analyzing global exhibition data completeness</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Global Exhibition Data Audit
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of exhibition stands data completeness and automated publishing system
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={performDataAudit} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Audit
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publishing Settings</DialogTitle>
                <DialogDescription>
                  Configure automated publishing preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto-publish on detection</span>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Batch size</span>
                  <span>50 pages</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      {auditData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {auditData.completionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
              </div>
              <Progress value={auditData.completionRate} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed Pages</p>
                  <p className="text-3xl font-bold text-green-800">
                    {auditData.completedCountries + auditData.completedCities}
                  </p>
                  <p className="text-xs text-green-600">
                    {auditData.completedCountries} countries, {auditData.completedCities} cities
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Missing Pages</p>
                  <p className="text-3xl font-bold text-orange-800">
                    {auditData.missingCountries.length + auditData.missingCities.length}
                  </p>
                  <p className="text-xs text-orange-600">
                    {auditData.missingCountries.length} countries, {auditData.missingCities.length} cities
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Coverage</p>
                  <p className="text-3xl font-bold text-purple-800">
                    {auditData.totalCountries + auditData.totalCities}
                  </p>
                  <p className="text-xs text-purple-600">
                    {auditData.totalCountries} countries, {auditData.totalCities} cities
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Publishing Status */}
      {publishingStatus.isRunning && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              Publishing in Progress
            </CardTitle>
            <CardDescription>
              {publishingStatus.currentItem && `Currently publishing: ${publishingStatus.currentItem}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={publishingStatus.progress} />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 font-medium text-green-600">{publishingStatus.completed.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Queue:</span>
                  <span className="ml-2 font-medium text-blue-600">{publishingStatus.queue.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Errors:</span>
                  <span className="ml-2 font-medium text-red-600">{publishingStatus.errors.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="missing">Missing Data</TabsTrigger>
          <TabsTrigger value="publish">Auto-Publish</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Countries Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Countries Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Countries:</span>
                      <Badge variant="outline">{auditData.totalCountries}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed:</span>
                      <Badge className="bg-green-100 text-green-800">{auditData.completedCountries}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Missing:</span>
                      <Badge className="bg-red-100 text-red-800">{auditData.missingCountries.length}</Badge>
                    </div>
                    <Progress 
                      value={(auditData.completedCountries / auditData.totalCountries) * 100} 
                      className="mt-4"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cities Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Cities Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Cities:</span>
                      <Badge variant="outline">{auditData.totalCities}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed:</span>
                      <Badge className="bg-green-100 text-green-800">{auditData.completedCities}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Missing:</span>
                      <Badge className="bg-red-100 text-red-800">{auditData.missingCities.length}</Badge>
                    </div>
                    <Progress 
                      value={(auditData.completedCities / auditData.totalCities) * 100} 
                      className="mt-4"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Missing Data Tab */}
        <TabsContent value="missing" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search missing items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
            </div>
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Continents</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

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
                    {filteredMissingData.countries.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredMissingData.countries.map((countrySlug) => {
                      const country = GLOBAL_EXHIBITION_DATA.countries.find(c => c.slug === countrySlug);
                      return (
                        <div key={countrySlug} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{country?.name || countrySlug}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{country?.continent}</Badge>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
                    {filteredMissingData.cities.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredMissingData.cities.map((cityId) => {
                      const city = getAllExpandedCities().find(c => c.id === cityId);
                      return (
                        <div key={cityId} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{city?.name || cityId}</span>
                            <p className="text-xs text-gray-500">{city?.country}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{city?.continent}</Badge>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Auto-Publish Tab */}
        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Automated Publishing
              </CardTitle>
              <CardDescription>
                Automatically generate and publish missing exhibition stand pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => auditData && startAutomatedPublishing(auditData.missingCountries.slice(0, 10))}
                  disabled={publishingStatus.isRunning || !auditData?.missingCountries.length}
                  className="h-20 flex-col"
                >
                  <Flag className="h-6 w-6 mb-2" />
                  Publish Missing Countries
                  <span className="text-xs opacity-75">
                    {auditData?.missingCountries.length || 0} pages
                  </span>
                </Button>

                <Button
                  onClick={() => auditData && startAutomatedPublishing(auditData.missingCities.slice(0, 20))}
                  disabled={publishingStatus.isRunning || !auditData?.missingCities.length}
                  className="h-20 flex-col"
                  variant="outline"
                >
                  <MapPin className="h-6 w-6 mb-2" />
                  Publish Missing Cities
                  <span className="text-xs opacity-75">
                    {auditData?.missingCities.length || 0} pages
                  </span>
                </Button>

                <Button
                  onClick={() => auditData && startAutomatedPublishing([
                    ...auditData.missingCountries.slice(0, 5),
                    ...auditData.missingCities.slice(0, 15)
                  ])}
                  disabled={publishingStatus.isRunning || (!auditData?.missingCountries.length && !auditData?.missingCities.length)}
                  className="h-20 flex-col bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Sparkles className="h-6 w-6 mb-2" />
                  Publish All Missing
                  <span className="text-xs opacity-75">
                    Smart batch publishing
                  </span>
                </Button>
              </div>

              {publishingStatus.completed.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 text-green-700">Recently Published:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {publishingStatus.completed.slice(-10).map((item) => (
                      <div key={item} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{item}</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {publishingStatus.errors.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3 text-red-700">Publishing Errors:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {publishingStatus.errors.map((item) => (
                      <div key={item} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">{item}</span>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Coverage by Continent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {EXPANDED_LOCATION_STATS.coverageByContinent && Object.entries(EXPANDED_LOCATION_STATS.coverageByContinent).map(([continent, count]) => (
                    <div key={continent} className="flex items-center justify-between">
                      <span>{continent}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{count} cities</Badge>
                        <div className="w-24 h-2 bg-gray-200 rounded">
                          <div 
                            className="h-full bg-blue-500 rounded"
                            style={{ width: `${(count / Math.max(...Object.values(EXPANDED_LOCATION_STATS.coverageByContinent))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publishing Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Last audit:</span>
                    <span className="text-gray-600">
                      {auditData?.lastUpdate ? new Date(auditData.lastUpdate).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pages published today:</span>
                    <Badge className="bg-blue-100 text-blue-800">{publishingStatus.completed.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated time to complete:</span>
                    <span className="text-gray-600">
                      {auditData ? Math.ceil((auditData.missingCountries.length + auditData.missingCities.length) / 20) : 0} hours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
