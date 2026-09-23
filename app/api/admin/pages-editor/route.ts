import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { storageAPI, PageContent } from '@/lib/data/storage';
import { GLOBAL_EXHIBITION_DATA } from '@/lib/data/globalCities';
import fs from 'fs';
import path from 'path';
import { getServerSupabase } from '@/lib/supabase';
import { getCityPageUrl, getCountryPageUrl } from '@/lib/utils/slugUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getDataFilePath() {
  try {
    return path.join(process.cwd(), 'data', 'page-contents.json');
  } catch {
    return 'page-contents.json';
  }
}

async function readAllPageContentsFromFile(): Promise<Record<string, PageContent>> {
  try {
    const filePath = getDataFilePath();
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeAllPageContentsToFile(map: Record<string, PageContent>) {
  try {
    const filePath = getDataFilePath();
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(map, null, 2), 'utf-8');
  } catch {}
}

// Persist edited JSON to GitHub so changes survive serverless restarts
async function commitToGitHub(fileRelativePath: string, contentJson: any) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_REPO_BRANCH || 'main';
  if (!token || !owner || !repo) return; // Silently skip if not configured

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${fileRelativePath}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  } as any;

  let sha: string | undefined;
  try {
    const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }
  } catch {}

  const message = `chore(cms): update ${fileRelativePath} via admin editor`;
  const contentBase64 = Buffer.from(
    typeof contentJson === 'string' ? contentJson : JSON.stringify(contentJson, null, 2)
  ).toString('base64');

  try {
    await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch,
        sha,
      }),
    });
  } catch {}
}

// Minimal site map; extend as needed
type PageItem = { title: string; path: string; type: 'static' | 'country' | 'city' };

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  if (action === 'list') {
    // Fetch all pages directly from Supabase page_contents table
    try {
      const sb = getServerSupabase();
      if (sb) {
        console.log('🔍 Fetching all pages from Supabase page_contents table...');
        
        const { data, error } = await sb
          .from('page_contents')
          .select('id, path, content, updated_at');
        
        if (error) {
          console.error('❌ Error fetching pages from Supabase:', error);
          throw error;
        }
        
        console.log(`✅ Successfully fetched ${data.length} pages from Supabase`);
        
        // Process the page data to extract paths and titles
        const pages: PageItem[] = data.map((record: any) => {
          // Extract path from the record
          let path = record.path || '';
          let title = '';
          let type: 'static' | 'country' | 'city' = 'static';
          
          // If no path, try to construct from id
          if (!path && record.id) {
            // For country pages: id is the country slug
            // For city pages: id is country-city
            if (record.id.includes('-') && !['home', 'custom-booth', 'booth-rental'].includes(record.id)) {
              // This is likely a city page
              const parts = record.id.split('-');
              if (parts.length >= 2) {
                // Reconstruct path for city page
                path = `/exhibition-stands/${parts[0]}/${parts.slice(1).join('-')}`;
                type = 'city';
              }
            } else if (!['home', 'custom-booth', 'booth-rental', '3d-rendering-and-concept-development', 
                          'trade-show-installation-and-dismantle', 'trade-show-project-management', 
                          'trade-show-graphics-printing'].includes(record.id)) {
              // This is likely a country page
              path = `/exhibition-stands/${record.id}`;
              type = 'country';
            } else {
              // This is a static page
              if (record.id === 'home') {
                path = '/';
              } else {
                path = `/${record.id.replace(/-/g, '-')}`;
              }
              type = 'static';
            }
          }
          
          // Determine title from content or construct from path
          if (record.content) {
            // Try to get title from SEO data
            if (record.content.seo && record.content.seo.metaTitle) {
              title = record.content.seo.metaTitle;
            } 
            // Try to get title from hero section
            else if (record.content.hero && record.content.hero.title) {
              title = record.content.hero.title;
            }
          }
          
          // If no title found, construct from path
          if (!title) {
            if (path === '/') {
              title = 'Home';
            } else if (path.startsWith('/exhibition-stands/')) {
              const parts = path.split('/').filter(Boolean);
              if (parts.length === 2) {
                // Country page
                title = `${parts[1].split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Exhibition Stands`;
              } else if (parts.length === 3) {
                // City page
                const country = parts[1].split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const city = parts[2].split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                title = `Exhibition Stands in ${city}, ${country}`;
              }
            } else {
              // Static page
              title = path.substring(1).split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            }
          }
          
          return {
            title,
            path,
            type
          };
        });
        
        // Add any missing static pages that should always be present
        const staticPages = [
          { title: 'Home', path: '/', type: 'static' },
          { title: 'Custom Booth', path: '/custom-booth', type: 'static' },
          { title: 'Booth Rental', path: '/booth-rental', type: 'static' },
          { title: '3D Rendering & Concept Development', path: '/3d-rendering-and-concept-development', type: 'static' },
          { title: 'Installation & Dismantle', path: '/trade-show-installation-and-dismantle', type: 'static' },
          { title: 'Project Management', path: '/trade-show-project-management', type: 'static' },
          { title: 'Graphics & Printing', path: '/trade-show-graphics-printing', type: 'static' },
          { title: 'About', path: '/about', type: 'static' }
        ];
        
        // Merge static pages with Supabase pages, ensuring no duplicates
        const staticPagePaths = new Set(staticPages.map(p => p.path));
        const supabasePages = pages.filter(p => !staticPagePaths.has(p.path));
        const allPages = [...staticPages, ...supabasePages];
        
        // De-duplicate by path
        const seen = new Set<string>();
        const unique = allPages.filter(p => (seen.has(p.path) ? false : (seen.add(p.path), true)));
        
        console.log('📊 Total unique pages generated:', unique.length);
        return NextResponse.json(
          { success: true, data: unique },
          { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
      } else {
        // Fallback to the original implementation if Supabase is not configured
        console.log('⚠️ Supabase not configured, falling back to global dataset');
        
        // Generate all pages dynamically from global dataset
        const pages: PageItem[] = [];
        
        // Add static pages
        pages.push(
          { title: 'Home', path: '/', type: 'static' },
          { title: 'Custom Booth', path: '/custom-booth', type: 'static' },
          { title: 'Booth Rental', path: '/booth-rental', type: 'static' },
          { title: '3D Rendering & Concept Development', path: '/3d-rendering-and-concept-development', type: 'static' },
          { title: 'Installation & Dismantle', path: '/trade-show-installation-and-dismantle', type: 'static' },
          { title: 'Project Management', path: '/trade-show-project-management', type: 'static' },
          { title: 'Graphics & Printing', path: '/trade-show-graphics-printing', type: 'static' },
          { title: 'About', path: '/about', type: 'static' }
        );
        
        // Include all country pages from global dataset
        try {
          console.log('🌍 Generating pages for', GLOBAL_EXHIBITION_DATA.countries.length, 'countries');
          GLOBAL_EXHIBITION_DATA.countries.forEach((c) => {
            pages.push({ title: `${c.name} Exhibition Stands`, path: `/exhibition-stands/${c.slug}`, type: 'country' });
          });
          
          // Include all city pages from global dataset
          console.log('🏙️ Generating pages for', GLOBAL_EXHIBITION_DATA.cities.length, 'cities');
          GLOBAL_EXHIBITION_DATA.cities.forEach((city) => {
            const country = GLOBAL_EXHIBITION_DATA.countries.find((c) => c.name === city.country);
            if (country) {
              pages.push({
                title: `Exhibition Stands in ${city.name}, ${country.name}`,
                path: `/exhibition-stands/${country.slug}/${city.slug}`,
                type: 'city'
              });
            }
          });
        } catch (error) {
          console.error('❌ Error generating pages from global dataset:', error);
        }
        
        try {
          const all = storageAPI.getAllPageContents();
          all.forEach((pc) => {
            const path = pc.type === 'city'
              ? getCityPageUrl(pc.location.country || '', pc.location.slug)
              : getCountryPageUrl(pc.location.name || pc.location.slug);
            pages.push({
              title: pc.hero.title || pc.seo.metaTitle || pc.location.name,
              path,
              type: pc.type,
            });
          });
        } catch (error) {
          console.error('❌ Error adding storage API pages:', error);
        }
        
        // De-duplicate by path
        const seen = new Set<string>();
        const unique = pages.filter(p => (seen.has(p.path) ? false : (seen.add(p.path), true)));
        
        console.log('📊 Total unique pages generated:', unique.length);
        return NextResponse.json(
          { success: true, data: unique },
          { headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
      }
    } catch (error) {
      console.error('❌ Error fetching pages from Supabase:', error);
      
      // Fallback to the original implementation if there's an error
      // Generate all pages dynamically from global dataset
      const pages: PageItem[] = [];
      
      // Add static pages
      pages.push(
        { title: 'Home', path: '/', type: 'static' },
        { title: 'Custom Booth', path: '/custom-booth', type: 'static' },
        { title: 'Booth Rental', path: '/booth-rental', type: 'static' },
        { title: '3D Rendering & Concept Development', path: '/3d-rendering-and-concept-development', type: 'static' },
        { title: 'Installation & Dismantle', path: '/trade-show-installation-and-dismantle', type: 'static' },
        { title: 'Project Management', path: '/trade-show-project-management', type: 'static' },
        { title: 'Graphics & Printing', path: '/trade-show-graphics-printing', type: 'static' },
        { title: 'About', path: '/about', type: 'static' }
      );
      
      // Include all country pages from global dataset
      try {
        console.log('🌍 Generating pages for', GLOBAL_EXHIBITION_DATA.countries.length, 'countries');
        GLOBAL_EXHIBITION_DATA.countries.forEach((c) => {
          pages.push({ title: `${c.name} Exhibition Stands`, path: `/exhibition-stands/${c.slug}`, type: 'country' });
        });
        
        // Include all city pages from global dataset
        console.log('🏙️ Generating pages for', GLOBAL_EXHIBITION_DATA.cities.length, 'cities');
        GLOBAL_EXHIBITION_DATA.cities.forEach((city) => {
          const country = GLOBAL_EXHIBITION_DATA.countries.find((c) => c.name === city.country);
          if (country) {
            pages.push({
              title: `Exhibition Stands in ${city.name}, ${country.name}`,
              path: `/exhibition-stands/${country.slug}/${city.slug}`,
              type: 'city'
            });
          }
        });
      } catch (error) {
        console.error('❌ Error generating pages from global dataset:', error);
      }
      
      try {
        const all = storageAPI.getAllPageContents();
        all.forEach((pc) => {
          const path = pc.type === 'city'
            ? getCityPageUrl(pc.location.country || '', pc.location.slug)
            : getCountryPageUrl(pc.location.name || pc.location.slug);
          pages.push({
            title: pc.hero.title || pc.seo.metaTitle || pc.location.name,
            path,
            type: pc.type,
          });
        });
      } catch (error) {
        console.error('❌ Error adding storage API pages:', error);
      }
      
      // De-duplicate by path
      const seen = new Set<string>();
      const unique = pages.filter(p => (seen.has(p.path) ? false : (seen.add(p.path), true)));
      
      console.log('📊 Total unique pages generated:', unique.length);
      return NextResponse.json(
        { success: true, data: unique },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }
  }
  if (action === 'get-content') {
    const path = searchParams.get('path') || '';
    if (!path) return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 });
    
    let pageId = '';
    const parts = path.split('/').filter(Boolean);
    
    // Handle dynamic country/city pages and home info cards
    if (parts[0] === 'exhibition-stands') {
      if (parts.length >= 3) {
        // City page: /exhibition-stands/{country}/{city} -> pageId = country-city
        pageId = `${parts[1]}-${parts[2]}`;
        console.log('🏙️ API Debug - City page detected:', { path, pageId, parts });
      } else if (parts.length >= 2) {
        // Country page: /exhibition-stands/{country} -> pageId = country
        pageId = parts[1];
        console.log('🌍 API Debug - Country page detected:', { path, pageId, parts });
      } else {
        pageId = 'exhibition-stands';
      }
    } else if (parts.length === 0) {
      pageId = 'home';
    } else {
      pageId = parts.join('-');
    }
    
    console.log('🔍 API Debug - Final pageId:', pageId, 'for path:', path);
    
    // Prefer Supabase if configured
    try {
      const sb = getServerSupabase();
      if (sb) {
        console.log('🔍 API Debug - Fetching from Supabase for pageId:', pageId);
        
        // Check if this is a special country that needs enhanced query strategies
        const isSpecialCountry = ['jordan', 'lebanon', 'israel', 'iraq', 'uae', 'united-arab-emirates', 'saudi-arabia', 'qatar', 'kuwait', 'bahrain', 'oman', 'egypt', 'morocco', 'iran', 'russia', 'indonesia', 'malaysia', 'china', 'japan', 'south-korea', 'brazil', 'mexico', 'canada', 'south-africa', 'singapore', 'thailand', 'philippines', 'turkey', 'czech-republic', 'hungary', 'nigeria', 'kenya', 'de', 'gb', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'se', 'no', 'dk', 'fi', 'pl', 'tw', 'hk', 'nz', 'vn', 'at', 'au', 'cz', 'hu', 'ng', 'ke', 'br', 'mx', 'za', 'sg', 'th', 'ph', 'tr', 'ru', 'id', 'my', 'cn', 'jp', 'kr'].includes(pageId);
        
        let data, error;
        
        if (isSpecialCountry) {
          console.log('🔍 API Debug - Special country detected:', pageId);
          // Try multiple query patterns for special countries
          const result = await sb
            .from('page_contents')
            .select('content')
            .or(`id.eq.${pageId},id.eq.exhibition-stands-${pageId}`)
            .order('updated_at', { ascending: false })
            .limit(1);
            
          if (result.data?.[0]) {
            data = result.data[0];
            error = null;
          } else {
            // Fallback to exact match
            const exactResult = await sb
              .from('page_contents')
              .select('content')
              .eq('id', pageId)
              .maybeSingle(); // Use maybeSingle to handle cases where no data is found
              
            data = exactResult.data;
            error = exactResult.error;
          }
        } else {
          // Standard query for other content
          const result = await sb
            .from('page_contents')
            .select('content')
            .eq('id', pageId)
            .maybeSingle(); // Use maybeSingle to handle cases where no data is found
            
          data = result.data;
          error = result.error;
        }
        
        if (error) {
          console.log('❌ Supabase error:', error);
          console.log('❌ Supabase error details:', {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details
          });
          // Return success with null data instead of error to avoid 500 errors
          return NextResponse.json(
            { 
              success: true, 
              data: null,
              error: {
                message: error.message,
                code: error.code,
                details: 'Supabase query failed - check server logs for details'
              }
            },
            { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'supabase', 'x-sb-present': 'true' } }
          );
        }
        
        // Handle case where no data is found
        if (!data) {
          console.log('⚠️ No data found in Supabase for pageId:', pageId);
          return NextResponse.json(
            { success: true, data: null },
            { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'supabase', 'x-sb-present': 'true' } }
          );
        }
        
        console.log('✅ Supabase data retrieved for pageId:', pageId);
        console.log('📊 Content structure:', Object.keys(data?.content || {}));
        console.log('🏳️ Sections:', Object.keys(data?.content?.sections || {}));
        console.log('🏳️ Country pages in retrieved data:', data?.content?.sections?.countryPages);
        
        // Special debug for custom-booth
        if (pageId === 'custom-booth') {
          console.log('🎨 Custom-booth GET debug - pageId:', pageId);
          console.log('🎨 Custom-booth GET debug - sections:', data?.content?.sections);
          console.log('🎨 Custom-booth GET debug - hero:', data?.content?.sections?.hero);
          console.log('🎨 Custom-booth GET debug - whyChooseCustom:', data?.content?.sections?.whyChooseCustom);
          console.log('🎨 Custom-booth GET debug - customDesignServices:', data?.content?.sections?.customDesignServices);
        }
        
        // For country or city pages, ensure we return the correct structure
        if (parts[0] === 'exhibition-stands' || path === '/') {
          // For the homepage, just return full content so editors can read sections.countryPages.homeInfoCards
          if (parts.length >= 3) {
            // For city pages, return the FULL document so CMS has SEO/content and the editor can pick cityPages[key]
            return NextResponse.json(
              { success: true, data: data?.content || null, error: null },
              { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'supabase', 'x-sb-present': 'true' } }
            );
          } else if (parts.length >= 2) {
            const countrySlug = parts[1];
            const countryData = data?.content?.sections?.countryPages?.[countrySlug];
            console.log('🌍 Country data for', countrySlug, ':', countryData);
            if (countryData) {
              // If countryData has nested countryPages, extract the inner data
              const actualCountryData = (countryData as any)?.countryPages?.[countrySlug] || countryData;
              console.log('🌍 Actual country data for API:', actualCountryData);
              
              return NextResponse.json(
                { 
                  success: true, 
                  data: { 
                    ...data.content,
                    sections: {
                      ...data.content.sections,
                      countryPages: {
                        [countrySlug]: actualCountryData
                      }
                    }
                  }, 
                  error: null 
                },
                { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'supabase', 'x-sb-present': 'true' } }
              );
            }
          }
        }
        
        return NextResponse.json(
          { success: true, data: data?.content || null, error: null },
          { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'supabase', 'x-sb-present': 'true' } }
        );
      }
    } catch (e) {
      console.log('❌ Supabase fetch error:', e);
      // Return success with null data instead of error to avoid 500 errors
      return NextResponse.json(
        { success: true, data: null },
        { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'supabase', 'x-sb-present': 'false' } }
      );
    }

    const fileMap = await readAllPageContentsFromFile();
    const content = fileMap[pageId] || storageAPI.getPageContent(pageId);
    return NextResponse.json(
      { success: true, data: content || null },
      { headers: { 'Cache-Control': 'no-store, max-age=0', 'x-cms-source': 'file', 'x-sb-present': String(!!getServerSupabase()) } }
    );
  }
  if (action === 'save-content') {
    const pathParam = searchParams.get('path') || '';
    if (!pathParam) return NextResponse.json({ success: false, error: 'Missing path' }, { status: 400 });
    // For GET save-content usage (not ideal), just return latest saved content
    let pageId = '';
    const parts = pathParam.split('/').filter(Boolean);
    if (parts[0] === 'exhibition-stands') pageId = parts.slice(1).join('-');
    else if (parts.length === 0) pageId = 'home';
    else pageId = parts.join('-');
    const fileMap = await readAllPageContentsFromFile();
    const content = fileMap[pageId] || storageAPI.getPageContent(pageId);
    return NextResponse.json(
      { success: true, data: content || null },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
  return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path, seo, h1, contentHtml, structured, sections, reviews, buttons } = body || {};
    if (action !== 'update' || !path) {
      return NextResponse.json({ success: false, error: 'Missing action or path' }, { status: 400 });
    }

    // Infer pageId from path
    // /exhibition-stands/{country}[/{city}] or static
    let pageId = '';
    const parts = path.split('/').filter(Boolean);
    const isLocation = parts[0] === 'exhibition-stands';
    const isCityPage = isLocation && parts.length >= 3;
    
    if (isLocation) {
      if (isCityPage) {
        // City page id: country-city
        pageId = `${parts[1]}-${parts[2]}`;
        console.log('🏙️ PUT Debug - City page detected:', { path, pageId, parts });
      } else if (parts.length >= 2) {
        // Country page id: country
        pageId = parts[1];
        console.log('🌍 PUT Debug - Country page detected:', { path, pageId, parts });
      } else {
        pageId = 'exhibition-stands';
      }
    } else if (parts.length === 0) {
      pageId = 'home';
    } else {
      pageId = parts.join('-');
    }
    if (!pageId) pageId = 'home';

    // Debug: Log pageId generation
    console.log('🔍 API Debug - Path:', path, 'PageId:', pageId, 'Parts:', parts);
    
    // Special debug for custom-booth
    if (path === '/custom-booth') {
      console.log('🎨 Custom-booth debug - Path:', path, 'PageId:', pageId);
      console.log('🎨 Custom-booth debug - Sections received:', JSON.stringify(sections, null, 2));
    }

    // Load existing from storage (if any) and merge minimal SEO/H1
    const existing = storageAPI.getPageContent(pageId);
    const updated: PageContent = existing ? { ...existing } : {
      id: pageId,
      type: isCityPage ? 'city' : 'country',
      location: isCityPage ? { name: parts[2], country: parts[1], slug: pageId } : { name: parts[1] || pageId, slug: pageId },
      seo: { metaTitle: '', metaDescription: '', keywords: [], canonicalUrl: `https://standszone.com${path}` },
      hero: { title: '', subtitle: '', description: '', ctaText: 'Get Free Quote' },
      content: { introduction: '', whyChooseSection: '', industryOverview: '', venueInformation: '', builderAdvantages: '', conclusion: '' },
      design: { primaryColor: '#CC2E2E', accentColor: '#f97316', layout: 'modern', showStats: true, showMap: false },
      lastModified: new Date().toISOString(),
    };

    if (seo) {
      updated.seo.metaTitle = seo.title ?? updated.seo.metaTitle;
      updated.seo.metaDescription = seo.description ?? updated.seo.metaDescription;
      if (Array.isArray(seo.keywords)) updated.seo.keywords = seo.keywords;
    }
    if (typeof h1 === 'string' && h1.length > 0) {
      updated.hero.title = h1;
    }
    if (typeof contentHtml === 'string' && contentHtml.trim().length > 0) {
      // Store into introduction/conclusion to surface on pages; keep raw in extra
      updated.content.introduction = contentHtml;
      (updated.content as any).extra = {
        ...(updated.content as any).extra,
        rawHtml: contentHtml,
        structured: structured ?? (updated.content as any).extra?.structured,
      };
    }

    // Merge section-aware updates (do not overwrite unrelated fields)
    if (sections && typeof sections === 'object') {
      console.log('🔍 API Debug - Sections received:', JSON.stringify(sections, null, 2));
      const currentSections = (updated as any).sections || {};
      if (isCityPage) {
        // Accept either flat sections or sections.cityPages[pageId]
        const cityKey = pageId; // country-city
        const prevCityPages = currentSections.cityPages || {};
        const incomingCitySections = (sections as any).cityPages && (sections as any).cityPages[cityKey]
          ? (sections as any).cityPages[cityKey]
          : sections;
        (updated as any).sections = {
          ...currentSections,
          cityPages: {
            ...prevCityPages,
            [cityKey]: {
              ...(prevCityPages[cityKey] || {}),
              ...incomingCitySections,
            },
          },
        };
      } else if (isLocation) {
        // Handle country pages with countryPages structure
        const countrySlug = parts[1];
        const prevCountryPages = currentSections.countryPages || {};
        const incomingCountrySections = (sections as any).countryPages && (sections as any).countryPages[countrySlug]
          ? (sections as any).countryPages[countrySlug]
          : sections;
        
        // Prevent double-nesting by extracting inner countryPages if it exists
        const actualIncomingSections = (incomingCountrySections as any)?.countryPages?.[countrySlug] || incomingCountrySections;
        
        (updated as any).sections = {
          ...currentSections,
          countryPages: {
            ...prevCountryPages,
            [countrySlug]: {
              ...(prevCountryPages[countrySlug] || {}),
              ...actualIncomingSections,
            },
          },
        };
      } else {
        (updated as any).sections = { ...currentSections, ...sections };
      }
      console.log('🔍 API Debug - Updated sections:', JSON.stringify((updated as any).sections, null, 2));
    }

    // Accept top-level reviews/buttons for Home editor schema
    if (Array.isArray(reviews)) {
      // Prefer storing under sections.reviews but also keep a top-level mirror for compatibility
      (updated as any).sections = {
        ...(updated as any).sections,
        reviews: reviews,
      };
      (updated as any).reviews = reviews;
    }
    if (Array.isArray(buttons)) {
      // Store raw array for flexible grouping on client
      (updated as any).buttons = buttons;
      // Additionally map common groups to existing keys if present
      const heroBtns = buttons.filter((b:any)=> (b.section||'').toLowerCase() === 'hero').map((b:any)=>({ text:b.text, href:b.link||b.href }));
      if (heroBtns.length > 0) {
        (updated as any).sections = { ...(updated as any).sections, heroButtons: heroBtns };
      }
      const finalBtns = buttons.filter((b:any)=> (b.section||'').toLowerCase() === 'finalcta').map((b:any)=>({ text:b.text, href:b.link||b.href }));
      if (finalBtns.length > 0) {
        const prevFinal = (updated as any).sections?.finalCta || {};
        (updated as any).sections = { ...(updated as any).sections, finalCta: { ...prevFinal, buttons: finalBtns } };
      }
    }

    // If Supabase configured, upsert there (durable). Else fallback to file+GitHub path
    let savedToSupabase = false;
    try {
      const sb = getServerSupabase();
      if (sb) {
        console.log('💾 Saving to Supabase - pageId:', pageId);
        console.log('💾 Saving to Supabase - content structure:', JSON.stringify(updated, null, 2));
        console.log('💾 Saving to Supabase - sections structure:', JSON.stringify((updated as any).sections, null, 2));
        
        const { error } = await sb
          .from('page_contents')
          .upsert({ id: pageId, path, content: updated, updated_at: new Date().toISOString() });
        
        if (!error) {
          savedToSupabase = true;
          console.log('✅ Successfully saved to Supabase');
        } else {
          console.log('❌ Supabase save error:', error);
          console.log('❌ Supabase save error details:', {
            message: error.message,
            code: error.code,
            hint: error.hint,
            details: error.details
          });
          return NextResponse.json({ 
            success: false, 
            error: error.message,
            details: {
              code: error.code,
              hint: error.hint,
              message: 'Failed to save to Supabase - check server logs for details'
            }
          }, { status: 500 });
        }
      }
    } catch (e) {
      console.log('❌ Supabase save exception:', e);
    }

    // Special handling for Jordan, Lebanon, and Israel to ensure content updates
    const isSpecialCountry = ['jordan', 'lebanon', 'israel'].some(country => 
      pageId === country || pageId.startsWith(`${country}-`)
    );
    
    if (isSpecialCountry) {
      try {
        console.log('🔄 Special country detected in pages-editor, forcing Supabase update for:', pageId);
        const sb = getServerSupabase();
        
        if (sb) {
          // Force a direct update to Supabase with multiple ID formats to ensure it's found
          const { data, error } = await sb
            .from('page_contents')
            .upsert({
              id: pageId,
              path,
              content: updated,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          
          if (error) {
            console.error('⚠️ Special country Supabase update error:', error);
            console.error('⚠️ Special country Supabase update error details:', {
              message: error.message,
              code: error.code,
              hint: error.hint,
              details: error.details
            });
            
            // Try alternative ID formats as fallback
            const alternativeIds = [
              pageId,
              `country-${pageId}`,
              pageId.replace('exhibition-stands-', '')
            ];
            
            for (const altId of alternativeIds) {
              console.log('🔄 Trying alternative ID format:', altId);
              const { error: altError } = await sb
                .from('page_contents')
                .upsert({
                  id: altId,
                  path,
                  content: updated,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                
              if (!altError) {
                console.log('✅ Alternative ID format successful:', altId);
                break;
              } else {
                console.error('❌ Alternative ID format failed:', altId, altError);
              }
            }
          } else {
            console.log('✅ Special country direct Supabase update successful for:', pageId);
          }
        }
      } catch (dbError) {
        console.error('❌ Error during special country database update:', dbError);
      }
    }
    
    if (!savedToSupabase) {
      storageAPI.savePageContent(pageId, updated);
      const current = await readAllPageContentsFromFile();
      current[pageId] = updated;
      await writeAllPageContentsToFile(current);
      try { await commitToGitHub('data/page-contents.json', current); } catch {}
    }

    try { 
      // Force revalidation for special countries
      if (isSpecialCountry) {
        console.log('🔄 Forcing path revalidation for special country:', path);
        revalidatePath(path, 'page');
        revalidatePath('/exhibition-stands/[country]', 'page');
        if (pageId.includes('-')) {
          revalidatePath('/exhibition-stands/[country]/[city]', 'page');
        }
      } else {
        revalidatePath(path);
      }
    } catch {}
    try {
      const evt = new CustomEvent('global-pages:updated', { detail: { pageId } });
      // no-op on server; clients listen on window
    } catch {}

    return NextResponse.json(
      { success: true, data: updated },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 });
  }
}

