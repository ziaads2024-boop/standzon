"use client";

import React, { useState, useEffect } from "react";
import { getCityPageUrl, getCountryPageUrl } from '@/lib/utils/slugUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Globe,
  MapPin,
  Building2,
  Users,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  ExternalLink,
  TrendingUp,
  Award,
  Calendar,
  Target,
  Star,
  Settings,
  Save,
  X,
  FileText,
  Hash,
  Tag,
  Globe2,
  Palette,
  Layout,
} from "lucide-react";

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
  type: "country" | "city";
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
  content?: {
    heroTitle: string;
    heroDescription: string;
    mainContent: string;
    features: string[];
    sectionHeading?: string;
    personalizedHtml?: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
}

interface PageEditorProps {
  page: PageConfig;
  onSave: (pageId: string, content: any) => void;
  onClose: () => void;
}

function PageEditor({ page, onSave, onClose }: PageEditorProps) {
  const [content, setContent] = useState(
    page.content || {
      heroTitle:
        page.seoData.title || `Exhibition Stands in ${page.location.name}`,
      heroDescription:
        page.seoData.description ||
        `Find the best exhibition stand builders in ${page.location.name}. Professional, reliable, and innovative solutions for your next trade show.`,
      mainContent: `Discover top-quality exhibition stand builders in ${page.location.name}. Our verified professionals deliver exceptional stands that make your brand stand out at trade shows and exhibitions.`,
      features: [
        "Professional exhibition stand design",
        "Custom branding solutions",
        "On-site installation support",
        "Post-show maintenance",
      ],
      sectionHeading: `Ready to Find Your Perfect Builder in ${page.location.name}?`,
      personalizedHtml:
        '<p>Add your personalized content here. You can make text <strong>bold</strong>, add headings, and <a href="#">links</a>.</p>',
      metaTitle:
        page.seoData.title ||
        `Exhibition Stands ${page.location.name} | Professional Builders`,
      metaDescription:
        page.seoData.description ||
        `Find professional exhibition stand builders in ${page.location.name}. Custom designs, reliable service, and competitive pricing.`,
      metaKeywords: page.seoData.keywords || [
        "exhibition stands",
        page.location.name,
        "trade show",
        "exhibition builders",
        "custom stands",
      ],
    }
  );
  const [seoData, setSeoData] = useState(page.seoData);
  const [slug, setSlug] = useState(page.location.slug);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const exec = (command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
    } catch {}
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedContent = {
        ...content,
        metaTitle: seoData.title,
        metaDescription: seoData.description,
        metaKeywords: seoData.keywords,
      };

      await onSave(page.location.slug, {
        content: updatedContent,
        seoData,
        slug,
      });

      toast({
        title: "Page Updated Successfully!",
        description: `Changes saved for ${page.location.name}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to save page changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Edit Page: {page.location.name}
            </h2>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Editor */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Page Content
              </h3>

              <div>
                <Label>Hero Title</Label>
                <Input
                  value={content.heroTitle}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                  placeholder="Enter hero title"
                />
              </div>

              <div>
                <Label>Hero Description</Label>
                <Textarea
                  value={content.heroDescription}
                  onChange={(e) =>
                    setContent({ ...content, heroDescription: e.target.value })
                  }
                  placeholder="Enter hero description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Section Heading</Label>
                <Input
                  value={content.sectionHeading}
                  onChange={(e) =>
                    setContent({ ...content, sectionHeading: e.target.value })
                  }
                  placeholder="Ready to Find Your Perfect Builder in …?"
                />
              </div>

              <div>
                <Label>Personalized Section Content</Label>
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <Button type="button" variant="outline" size="sm" onClick={() => exec('bold')}>Bold</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => exec('formatBlock', 'H2')}>H2</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => exec('formatBlock', 'H3')}>H3</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => exec('formatBlock', 'H4')}>H4</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { const url = prompt('Enter URL'); if (url) exec('createLink', url); }}>Link</Button>
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[160px] border rounded-md p-3 prose max-w-none"
                  onInput={(e) => setContent({ ...content, personalizedHtml: (e.target as HTMLElement).innerHTML || '' })}
                  dangerouslySetInnerHTML={{ __html: content.personalizedHtml || '' as unknown as string }}
                />
                <p className="text-xs text-gray-500 mt-1">Basic formatting supported. This content will render on the country page.</p>
              </div>

              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  value={content.features.join("\n")}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      features: e.target.value
                        .split("\n")
                        .filter((f) => f.trim()),
                    })
                  }
                  placeholder="Enter features, one per line"
                  rows={4}
                />
              </div>
            </div>

            {/* SEO & Settings Editor */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe2 className="w-5 h-5" />
                SEO & Settings
              </h3>

              <div>
                <Label>Page Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Enter page slug"
                  className="font-mono"
                />
              </div>

              <div>
                <Label>Meta Title</Label>
                <Input
                  value={seoData.title}
                  onChange={(e) =>
                    setSeoData({ ...seoData, title: e.target.value })
                  }
                  placeholder="Enter meta title"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={seoData.description}
                  onChange={(e) =>
                    setSeoData({ ...seoData, description: e.target.value })
                  }
                  placeholder="Enter meta description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Meta Keywords (comma separated)</Label>
                <Input
                  value={seoData.keywords.join(", ")}
                  onChange={(e) =>
                    setSeoData({
                      ...seoData,
                      keywords: e.target.value
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k),
                    })
                  }
                  placeholder="Enter keywords, separated by commas"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
              {!isSaving && <Save className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalPagesManager() {
  const [stats, setStats] = useState<GlobalPageStats | null>(null);
  const [countryPages, setCountryPages] = useState<PageConfig[]>([]);
  const [cityPages, setCityPages] = useState<PageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "country" | "city">(
    "all"
  );
  const [showOnlyWithBuilders, setShowOnlyWithBuilders] = useState(false);
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  const continents = [
    "Europe",
    "Asia",
    "North America",
    "South America",
    "Africa",
    "Oceania",
  ];

  useEffect(() => {
    loadGlobalPagesData();
  }, []);

  const loadGlobalPagesData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading global pages data...");

      // Load statistics
      const statsResponse = await fetch(
        "/api/admin/global-pages?action=statistics"
      );
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      // Load all pages
      const pagesResponse = await fetch(
        "/api/admin/global-pages?action=generate-all"
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.success) {
        setCountryPages(pagesData.data.countries);
        setCityPages(pagesData.data.cities);
        console.log(
          `✅ Loaded ${pagesData.data.countries.length} country pages and ${pagesData.data.cities.length} city pages`
        );
      }
    } catch (error) {
      console.error("❌ Error loading global pages:", error);
      toast({
        title: "Loading Failed",
        description: "Failed to load global pages data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAllPages = async () => {
    setGenerating(true);
    setGenerationProgress(0);

    try {
      console.log("🚀 Starting global page generation...");

      // Simulate generation progress
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        setGenerationProgress((i / totalSteps) * 100);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Actually generate pages
      const response = await fetch(
        "/api/admin/global-pages?action=generate-all"
      );
      const data = await response.json();

      if (data.success) {
        setCountryPages(data.data.countries);
        setCityPages(data.data.cities);

        // Refresh stats
        await loadGlobalPagesData();

        toast({
          title: "Pages Generated Successfully!",
          description: `Generated ${data.data.countries.length} country pages and ${data.data.cities.length} city pages with automatic GMB builder integration.`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("❌ Error generating pages:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate global pages.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Filter pages based on search criteria
  const getFilteredPages = () => {
    let allPages: PageConfig[] = [];

    if (selectedType === "all") {
      allPages = [...countryPages, ...cityPages];
    } else if (selectedType === "country") {
      allPages = countryPages;
    } else {
      allPages = cityPages;
    }

    return allPages.filter((page) => {
      const matchesSearch =
        page.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.location.country
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        page.location.continent
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesContinent =
        selectedContinent === "all" ||
        page.location.continent === selectedContinent;
      const matchesBuilders = !showOnlyWithBuilders || page.hasBuilders;

      return matchesSearch && matchesContinent && matchesBuilders;
    });
  };

  const filteredPages = getFilteredPages();

  const handleEditPage = (page: PageConfig) => {
    console.log("🖊️ Opening editor for page:", page.location.name);
    setEditingPage(page);
    setShowEditor(true);
  };

  const handleSavePageContent = async (pageId: string, content: any) => {
    try {
      console.log("💾 Saving page content for:", pageId, content);

      const response = await fetch("/api/admin/global-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-content",
          pageId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        const updatedPages = [...countryPages, ...cityPages].map((page) => {
          if (page.location.slug === pageId) {
            return {
              ...page,
              content: content.content,
              seoData: content.seoData,
              location: { ...page.location, slug: content.slug },
            };
          }
          return page;
        });

        setCountryPages(updatedPages.filter((p) => p.type === "country"));
        setCityPages(updatedPages.filter((p) => p.type === "city"));

        setShowEditor(false);
        setEditingPage(null);

        // Trigger ISR revalidation for affected public paths
        try {
          const countrySlug = (content.slug || pageId).toLowerCase();
          const paths: string[] = [
            `/exhibition-stands/${countrySlug}`
          ];
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths })
          });
        } catch {}

        // Broadcast client-side event so open pages can refetch immediately
        try {
          const event = new CustomEvent('global-pages:updated', { detail: { pageId: (content.slug || pageId).toLowerCase() } });
          window.dispatchEvent(event);
        } catch {}
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("❌ Error saving page content:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save page content.",
        variant: "destructive",
      });
    }
  };

  const handleViewPage = (page: PageConfig) => {
    const url =
      page.type === "country"
        ? getCountryPageUrl(page.location.name || page.location.slug)
        : getCityPageUrl(page.location.country || '', page.location.slug);

    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading global pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            Global Pages Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage content, SEO, and settings for all country and city pages
          </p>
        </div>

        <Button
          onClick={generateAllPages}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate All Pages
            </>
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      {generating && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating pages...</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPages}</p>
                  <p className="text-sm text-gray-600">Total Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.countryPages}</p>
                  <p className="text-sm text-gray-600">Country Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.cityPages}</p>
                  <p className="text-sm text-gray-600">City Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalBuilders}</p>
                  <p className="text-sm text-gray-600">Total Builders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value: any) => setSelectedType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="country">Countries</SelectItem>
                  <SelectItem value="city">Cities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Continent</Label>
              <Select
                value={selectedContinent}
                onValueChange={setSelectedContinent}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  {continents.map((continent) => (
                    <SelectItem key={continent} value={continent}>
                      {continent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-builders"
                checked={showOnlyWithBuilders}
                onChange={(e) => setShowOnlyWithBuilders(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show-builders">With Builders Only</Label>
            </div>

            <Button
              variant="outline"
              onClick={loadGlobalPagesData}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card className="max-h-[70vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pages ({filteredPages.length})
          </CardTitle>
          <CardDescription>
            Click edit to modify content, SEO, and settings for each page
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[55vh] pr-2">
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <div
                key={`${page.type}-${page.location.slug}`}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant={
                          page.type === "country" ? "default" : "secondary"
                        }
                      >
                        {page.type === "country" ? "🌍" : "🏙️"} {page.type}
                      </Badge>
                      <h3 className="text-lg font-semibold">
                        {page.location.name}
                      </h3>
                      {page.location.country && (
                        <span className="text-gray-500">
                          ({page.location.country})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Continent:</span>{" "}
                        {page.location.continent}
                      </div>
                      <div>
                        <span className="font-medium">Region:</span>{" "}
                        {page.location.region}
                      </div>
                      <div>
                        <span className="font-medium">Slug:</span>
                        <code className="ml-1 bg-gray-100 px-1 rounded">
                          {page.location.slug}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Builders:</span>{" "}
                        {page.builderCount}
                      </div>
                    </div>

                    {page.content && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Content:</strong> {page.content.heroTitle}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPage(page)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPage(page)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pages found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Page Editor Modal */}
      {showEditor && editingPage && (
        <PageEditor
          page={editingPage}
          onSave={handleSavePageContent}
          onClose={() => {
            setShowEditor(false);
            setEditingPage(null);
          }}
        />
      )}
    </div>
  );
}
