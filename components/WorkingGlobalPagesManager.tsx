'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, MapPin, Building2, Users, BarChart3, Search, Filter, 
  RefreshCw, Zap, CheckCircle, AlertCircle, Eye, Edit, ExternalLink,
  TrendingUp, Award, Calendar, Target, Star, Settings, Save, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { getCityPageUrl, getCountryPageUrl } from '@/lib/utils/slugUtils';

interface GlobalPageStats {
  totalPages: number;
  countryPages: number;
  cityPages: number;
  pagesWithBuilders: number;
  countriesWithBuilders: number;
  citiesWithBuilders: number;
  totalBuilders: number;
}

interface PageConfig {
  type: 'country' | 'city';
  location: {
    name: string;
    country?: string;
    continent: string;
    region: string;
    slug: string;
  };
  hasBuilders: boolean;
  builderCount: number;
  venues: any[];
  industries: string[];
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface EditablePageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  introduction: string;
  whyChooseSection: string;
  industryOverview: string;
  venueInformation: string;
  builderAdvantages: string;
  conclusion: string;
  ctaText: string;
}

export default function WorkingGlobalPagesManager() {
  const [stats, setStats] = useState<GlobalPageStats | null>(null);
  const [countryPages, setCountryPages] = useState<PageConfig[]>([]);
  const [cityPages, setCityPages] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'country' | 'city'>('all');
  const [showOnlyWithBuilders, setShowOnlyWithBuilders] = useState(false);
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [pageContent, setPageContent] = useState<EditablePageContent>({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    introduction: '',
    whyChooseSection: '',
    industryOverview: '',
    venueInformation: '',
    builderAdvantages: '',
    conclusion: '',
    ctaText: 'Get Free Quote'
  });

  const continents = ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

  useEffect(() => {
    loadGlobalPagesData();
  }, []);

  const loadGlobalPagesData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading global pages data...');
      
      // Load statistics
      const statsResponse = await fetch('/api/admin/global-pages?action=statistics');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
        console.log('✅ Loaded global pages statistics:', statsData.data);
      }
      
      // Load all pages
      const pagesResponse = await fetch('/api/admin/global-pages?action=generate-all');
      const pagesData = await pagesResponse.json();
      
      if (pagesData.success) {
        setCountryPages(pagesData.data.countries);
        setCityPages(pagesData.data.cities);
        console.log(`✅ Loaded ${pagesData.data.countries.length} country pages and ${pagesData.data.cities.length} city pages`);
      }
      
    } catch (error) {
      console.error('❌ Error loading global pages:', error);
      toast.error('Failed to load global pages data');
    } finally {
      setLoading(false);
    }
  };

  const generateAllPages = async () => {
    setGenerating(true);
    setGenerationProgress(0);
    
    try {
      console.log('🚀 Starting global page generation...');
      
      // Simulate generation progress
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        setGenerationProgress((i / totalSteps) * 100);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Actually generate pages
      const response = await fetch('/api/admin/global-pages?action=generate-all');
      const data = await response.json();
      
      if (data.success) {
        setCountryPages(data.data.countries);
        setCityPages(data.data.cities);
        
        // Refresh stats
        await loadGlobalPagesData();
        
        toast.success(`Pages Generated Successfully! Generated ${data.data.countries.length} country pages and ${data.data.cities.length} city pages with automatic GMB builder integration.`);
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      console.error('❌ Error generating pages:', error);
      toast.error('Failed to generate global pages');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Filter pages based on search criteria
  const getFilteredPages = () => {
    let allPages: PageConfig[] = [];
    
    if (selectedType === 'all') {
      allPages = [...countryPages, ...cityPages];
    } else if (selectedType === 'country') {
      allPages = countryPages;
    } else {
      allPages = cityPages;
    }
    
    return allPages.filter(page => {
      const matchesSearch = page.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.location.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.location.continent.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesContinent = selectedContinent === 'all' || page.location.continent === selectedContinent;
      const matchesBuilders = !showOnlyWithBuilders || page.hasBuilders;
      
      return matchesSearch && matchesContinent && matchesBuilders;
    });
  };

  const filteredPages = getFilteredPages();

  const handleEditPage = (page: PageConfig) => {
    console.log('🖊️ Opening editor for page:', page.location.name);
    setEditingPage(page);
    
    // Initialize page content with default values
    setPageContent({
      heroTitle: page.seoData.title,
      heroSubtitle: `Professional Exhibition Stand Builders`,
      heroDescription: page.seoData.description,
      introduction: `${page.location.name} stands as a premier exhibition destination, hosting dynamic trade shows and business events.`,
      whyChooseSection: `${page.location.name} offers unique advantages for exhibition projects with its strategic location and skilled local builders.`,
      industryOverview: `${page.location.name}'s exhibition industry serves diverse sectors, contributing to its position as a key business destination.`,
      venueInformation: `${page.location.name} offers modern exhibition facilities equipped with contemporary amenities and flexible spaces.`,
      builderAdvantages: `Choosing local ${page.location.name} exhibition stand builders provides strategic advantages including knowledge of venue requirements.`,
      conclusion: `${page.location.name} presents excellent opportunities for exhibition success with its growing business environment.`,
      ctaText: 'Get Free Quote'
    });
    
    setShowEditor(true);
  };

  const handleSavePageContent = async () => {
    if (!editingPage) return;
    
    try {
      console.log('💾 Saving page content for:', editingPage.location.name);
      
      const response = await fetch('/api/admin/global-pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-content',
          pageId: editingPage.location.slug,
          content: pageContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast.success(`Page content for ${editingPage.location.name} has been successfully updated.`);
      
      setShowEditor(false);
      setEditingPage(null);
      
      // Refresh the pages data
      await loadGlobalPagesData();
    } catch (error) {
      console.error('❌ Error saving page content:', error);
      toast.error('Failed to save page content');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading global pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Global Pages Manager</h2>
          <p className="text-gray-600 mt-2">Manage all country and city exhibition stand pages</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadGlobalPagesData} variant="outline" disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={generateAllPages} disabled={generating} className="bg-blue-600">
            <Zap className="w-4 h-4 mr-2" />
            {generating ? 'Generating...' : 'Generate All Pages'}
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      {generating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Generating Global Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Creating pages with automatic GMB builder integration... {Math.round(generationProgress)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pages</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPages}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Country Pages</p>
                  <p className="text-2xl font-bold text-green-600">{stats.countryPages}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">City Pages</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.cityPages}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Builders</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalBuilders}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
              <Select value={selectedType} onValueChange={(value: 'all' | 'country' | 'city') => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="country">Country Pages</SelectItem>
                  <SelectItem value="city">City Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Continent</label>
              <Select value={selectedContinent} onValueChange={setSelectedContinent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  {continents.map(continent => (
                    <SelectItem key={continent} value={continent}>{continent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Builders</label>
              <Button
                variant={showOnlyWithBuilders ? "default" : "outline"}
                onClick={() => setShowOnlyWithBuilders(!showOnlyWithBuilders)}
                className="w-full"
              >
                {showOnlyWithBuilders ? 'Show All' : 'With Builders Only'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Global Pages ({filteredPages.length})
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredPages.filter(p => p.hasBuilders).length} with builders
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto scroll-smooth p-4">
            <div className="space-y-4">
              {filteredPages.slice(0, 20).map((page, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {page.location.name}
                          {page.location.country && `, ${page.location.country}`}
                        </h3>
                        <Badge variant={page.type === 'country' ? 'default' : 'secondary'}>
                          {page.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {page.location.continent}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {page.builderCount} builders
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {page.venues.length} venues
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {page.industries.length} industries
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {page.industries.slice(0, 3).map((industry, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {page.industries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{page.industries.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {page.seoData.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {page.hasBuilders ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                      
                      <Button size="sm" variant="outline" onClick={() => handleEditPage(page)} className="text-gray-900">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button size="sm" variant="outline" asChild className="text-gray-900">
                        <a 
                          href={page.type === 'country'
                            ? getCountryPageUrl(page.location.name || page.location.slug)
                            : getCityPageUrl(page.location.country || '', page.location.slug)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No pages found matching your criteria</p>
                </div>
              )}

              {filteredPages.length > 20 && (
                <div className="text-center py-4 text-gray-500">
                  <p>Showing first 20 of {filteredPages.length} pages</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Editor Modal */}
      {showEditor && editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Edit Page Content</h3>
                  <p className="text-gray-600">{editingPage.location.name}</p>
                </div>
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Hero Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Hero Section</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                    <Input
                      value={pageContent.heroTitle}
                      onChange={(e) => setPageContent({...pageContent, heroTitle: e.target.value})}
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                    <Input
                      value={pageContent.heroSubtitle}
                      onChange={(e) => setPageContent({...pageContent, heroSubtitle: e.target.value})}
                      placeholder="Enter hero subtitle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                    <Textarea
                      value={pageContent.heroDescription}
                      onChange={(e) => setPageContent({...pageContent, heroDescription: e.target.value})}
                      placeholder="Enter hero description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Page Content</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Introduction</label>
                    <Textarea
                      value={pageContent.introduction}
                      onChange={(e) => setPageContent({...pageContent, introduction: e.target.value})}
                      placeholder="Enter introduction content"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Why Choose Section</label>
                    <Textarea
                      value={pageContent.whyChooseSection}
                      onChange={(e) => setPageContent({...pageContent, whyChooseSection: e.target.value})}
                      placeholder="Enter why choose content"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry Overview</label>
                    <Textarea
                      value={pageContent.industryOverview}
                      onChange={(e) => setPageContent({...pageContent, industryOverview: e.target.value})}
                      placeholder="Enter industry overview"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Information</label>
                    <Textarea
                      value={pageContent.venueInformation}
                      onChange={(e) => setPageContent({...pageContent, venueInformation: e.target.value})}
                      placeholder="Enter venue information"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Builder Advantages</label>
                    <Textarea
                      value={pageContent.builderAdvantages}
                      onChange={(e) => setPageContent({...pageContent, builderAdvantages: e.target.value})}
                      placeholder="Enter builder advantages"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conclusion</label>
                    <Textarea
                      value={pageContent.conclusion}
                      onChange={(e) => setPageContent({...pageContent, conclusion: e.target.value})}
                      placeholder="Enter conclusion"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
                    <Input
                      value={pageContent.ctaText}
                      onChange={(e) => setPageContent({...pageContent, ctaText: e.target.value})}
                      placeholder="Enter CTA button text"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePageContent}>
                <Save className="w-4 h-4 mr-2" />
                Save Content
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
