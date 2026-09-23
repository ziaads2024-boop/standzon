import type { Metadata } from 'next';
import siteMetadata from '@/app/metadata.json';
import AboutPageContent from '@/components/AboutPageContent';
import { getServerSupabase } from '@/lib/supabase';
import { getServerPageContent } from '@/lib/data/serverPageContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  // Try to fetch CMS content for metadata
  let cmsMetadata = null;
  try {
    const sb = getServerSupabase();
    if (sb) {
      const result = await sb
        .from('page_contents')
        .select('content')
        .eq('id', 'about')
        .single();
        
      if (!result.error && result.data?.content) {
        const content = result.data.content;
        const seo = content.seo || {};
        
        cmsMetadata = {
          title: seo.metaTitle || 'About StandsZone | Global Exhibition Stand Builder Network',
          description: seo.metaDescription || 'Learn about StandsZone\'s mission to connect exhibitors with top-rated exhibition stand builders worldwide. Over 40 countries, 500+ contractors, 5000+ successful projects.',
        };
      }
    }
  } catch (error) {
    console.error('❌ Error fetching CMS metadata:', error);
  }
  
  // Use CMS metadata if available, otherwise fall back to default
  const title = cmsMetadata?.title || 'About StandsZone | Global Exhibition Stand Builder Network';
  const description = cmsMetadata?.description || 'Learn about StandsZone\'s mission to connect exhibitors with top-rated exhibition stand builders worldwide. Over 40 countries, 500+ contractors, 5000+ successful projects.';
  
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      images: [{ url: '/og-image.jpg' }],
    },
    alternates: {
      canonical: 'https://standszone.com/about',
    },
  };
}

// Server component shell that renders the client component

export default async function AboutPage() {
  const saved = await getServerPageContent('about');
  return (
    <AboutPageContent initialSaved={saved} />
  );
}
