'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import { getAllExpandedCities, EXPANDED_LOCATION_STATS } from '@/lib/data/expandedLocations';
import {
  CheckCircle, AlertTriangle, Globe, MapPin, Flag, Database,
  TrendingUp, Eye, RefreshCw, ExternalLink, BarChart3,
  Activity, Zap, Target, Crown, Sparkles
} from 'lucide-react';
import { getCityPageUrl } from '@/lib/utils/slugUtils';

interface DataMetrics {
  totalItems: number;
  completedItems: number;
  missingItems: number;
  completionRate: number;
  countries: {
    total: number;
    completed: number;
    missing: number;
  };
  cities: {
    total: number;
    completed: number;
    missing: number;
  };
  continents: Array<{
    name: string;
    coverage: number;
    cities: number;
  }>;
  lastUpdate: string;
}

export default function DataCompletenessDashboard() {
  const [metrics, setMetrics] = useState<DataMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  console.log('📊 DataCompletenessDashboard loaded');

  // Calculate data completeness metrics
  const calculateMetrics = async (): Promise<DataMetrics> => {
    console.log('🔢 Calculating data completeness metrics...');

    // Get all data sources
    const allCountries = GLOBAL_EXHIBITION_DATA.countries;
    const allCities = getAllExpandedCities();

    // Simulate existing pages (replace with actual filesystem check)
    const existingPages = [
      '/exhibition-stands/germany/berlin',
      '/exhibition-stands/germany',
      '/exhibition-stands/united-arab-emirates/dubai',
      '/exhibition-stands/united-arab-emirates',
      '/exhibition-stands/united-states/las-vegas',
      '/exhibition-stands/united-states',
      '/exhibition-stands/france',
    ];

    // Calculate missing items
    const missingCountries = allCountries.filter(country => 
      !existingPages.includes(`/exhibition-stands/${country.slug}`)
    );

    const missingCities = allCities.filter(city =>
      !existingPages.includes(getCityPageUrl(city.country, city.name))
    );

    const totalItems = allCountries.length + allCities.length;
    const completedItems = (allCountries.length - missingCountries.length) + (allCities.length - missingCities.length);
    const missingItems = missingCountries.length + missingCities.length;
    const completionRate = (completedItems / totalItems) * 100;

    // Calculate continent coverage
    const continents = Object.entries(EXPANDED_LOCATION_STATS.coverageByContinent || {}).map(([name, cities]) => ({
      name,
      coverage: Math.random() * 40 + 60, // Simulate coverage percentage
      cities: cities as number
    }));

    const metrics: DataMetrics = {
      totalItems,
      completedItems,
      missingItems,
      completionRate,
      countries: {
        total: allCountries.length,
        completed: allCountries.length - missingCountries.length,
        missing: missingCountries.length
      },
      cities: {
        total: allCities.length,
        completed: allCities.length - missingCities.length,
        missing: missingCities.length
      },
      continents,
      lastUpdate: new Date().toISOString()
    };

    console.log('✅ Metrics calculated:', metrics);
    return metrics;
  };

  // Load metrics
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const newMetrics = await calculateMetrics();
      setMetrics(newMetrics);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Completeness Overview</h2>
          <p className="text-gray-600">Global exhibition stands data coverage and missing content analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh}
          </span>
          <Button onClick={loadMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button asChild size="sm">
            <a href="/admin/data-audit">
              <Eye className="h-4 w-4 mr-1" />
              Full Audit
            </a>
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Completion */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <Badge 
                className={
                  metrics.completionRate >= 80 
                    ? "bg-green-100 text-green-800"
                    : metrics.completionRate >= 60
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {metrics.completionRate >= 80 ? 'Excellent' : metrics.completionRate >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Overall Completion</p>
              <p className="text-3xl font-bold text-blue-800 mb-2">
                {metrics.completionRate.toFixed(1)}%
              </p>
              <Progress value={metrics.completionRate} className="mb-2" />
              <p className="text-xs text-blue-600">
                {metrics.completedItems} of {metrics.totalItems} pages complete
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Countries Status */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                {metrics.countries.completed}/{metrics.countries.total}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Countries</p>
              <p className="text-3xl font-bold text-green-800 mb-2">
                {((metrics.countries.completed / metrics.countries.total) * 100).toFixed(0)}%
              </p>
              <Progress 
                value={(metrics.countries.completed / metrics.countries.total) * 100} 
                className="mb-2" 
              />
              <p className="text-xs text-green-600">
                {metrics.countries.missing} countries missing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cities Status */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {metrics.cities.completed}/{metrics.cities.total}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Cities</p>
              <p className="text-3xl font-bold text-purple-800 mb-2">
                {((metrics.cities.completed / metrics.cities.total) * 100).toFixed(0)}%
              </p>
              <Progress 
                value={(metrics.cities.completed / metrics.cities.total) * 100} 
                className="mb-2"
              />
              <p className="text-xs text-purple-600">
                {metrics.cities.missing} cities missing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Missing Content Alert */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                Action Required
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Missing Pages</p>
              <p className="text-3xl font-bold text-orange-800 mb-2">
                {metrics.missingItems}
              </p>
              <div className="space-y-1 text-xs text-orange-600">
                <p>{metrics.countries.missing} countries</p>
                <p>{metrics.cities.missing} cities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continent Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Coverage by Continent
          </CardTitle>
          <CardDescription>
            Exhibition stands data coverage across different continents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.continents.map((continent) => (
              <div key={continent.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{continent.name}</span>
                  <Badge variant="outline">{continent.cities} cities</Badge>
                </div>
                <Progress value={continent.coverage} className="h-2" />
                <p className="text-xs text-gray-600">
                  {continent.coverage.toFixed(0)}% coverage
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Run Full Audit</h3>
            <p className="text-sm text-gray-600 mb-4">
              Perform comprehensive data completeness analysis
            </p>
            <Button asChild className="w-full">
              <a href="/admin/data-audit">
                <Database className="h-4 w-4 mr-2" />
                Start Audit
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Auto-Publish</h3>
            <p className="text-sm text-gray-600 mb-4">
              Automatically generate missing exhibition pages
            </p>
            <Button asChild className="w-full" variant="outline">
              <a href="/admin/data-audit?tab=publish">
                <Target className="h-4 w-4 mr-2" />
                Start Publishing
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">
              Detailed insights and publishing timeline
            </p>
            <Button asChild className="w-full" variant="outline">
              <a href="/admin/data-audit?tab=analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Details
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ready for Global Expansion</h3>
                <p className="text-sm text-gray-600">
                  {metrics.completedItems} pages live • {metrics.missingItems} pages queued for publishing
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {metrics.completionRate.toFixed(0)}% Complete
              </Badge>
              <Button asChild>
                <a href="/admin/data-audit">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
