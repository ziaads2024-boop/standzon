import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins, Roboto, Montserrat, Red_Hat_Display } from "next/font/google";
import { Toaster } from '@/components/ui/toaster';
import siteMetadata from '@/app/metadata.json';

import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import CriticalResourcePreloader from '@/components/CriticalResourcePreloader';
import DeferredAnalytics from '@/components/DeferredAnalytics';
import DeferredMonitoring from '@/components/DeferredMonitoring';
import NonCriticalScripts from '@/components/NonCriticalScripts';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppWrapper from '@/components/AppWrapper';
import { getFooterSettings } from '@/lib/data/footerSettings';
import JsonLd from '@/components/JsonLd';
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/structuredData';
// GlobalTypography temporarily disabled due to dev chunk issue

// Font optimization: Match DOCTYPE html.html exactly
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

// Limit font weights for performance
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'], // Reduced from ['300','400','500','600','700']
  display: 'optional',
  preload: true,
  variable: '--font-poppins'
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Reduced from ['300','400','500','700']
  display: 'optional',
  preload: true,
  variable: '--font-roboto'
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'], // Reduced from ['400','500','600','700']
  display: 'optional',
  preload: true,
  variable: '--font-montserrat'
});

const redHatDisplay = Red_Hat_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Reduced from ['400','500','600','700','900']
  display: 'optional',
  preload: true,
  variable: '--font-red-hat-display'
});



// Use centralized metadata for the root layout
const homeMeta: any = siteMetadata['/'];
export const metadata: Metadata = {
  ...homeMeta,
  // Resolves relative OG/canonical URLs and silences the metadataBase warning.
  metadataBase: new URL('https://standszone.com'),
  // ✅ SEO: Add robots meta tag
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
  // Default social preview image for every page that doesn't set its own.
  openGraph: {
    type: 'website',
    siteName: 'StandsZone',
    url: 'https://standszone.com',
    title: homeMeta?.title,
    description: homeMeta?.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'StandsZone' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeMeta?.title,
    description: homeMeta?.description,
    images: ['/og-image.png'],
  },
  // ✅ PERFORMANCE: Add performance hints
  other: {
    'x-dns-prefetch-control': 'on',
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialFooter = await getFooterSettings();
  return (
    <html lang="en" className="scroll-smooth h-full m-0 p-0" suppressHydrationWarning>
      <head>
        {/* ✅ FAVICON: Add favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />

        {/* Material Symbols Outlined for admin dashboard */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap" rel="stylesheet" />

        {/* ✅ PWA: Add manifest for installable app */}
        <link rel="manifest" href="/manifest.json" />

        {/* ✅ PWA: Add theme color for mobile browsers */}
        <meta name="theme-color" content="#252525" />

        {/* ✅ PWA: Add mobile-web-app-capable meta tag */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ✅ PWA: Add apple mobile web app meta tags */}
        <meta name="apple-mobile-web-app-title" content="StandsZone" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* ✅ RESPONSIVE: Add viewport meta tag for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes" />

        {/* robots is emitted by the Metadata API (root `metadata.robots` +
            per-page generateMetadata overrides). A hardcoded tag here would
            double up and fight the per-page noindex on thin / paginated pages. */}

        {/* ✅ PERFORMANCE: Critical resource optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="//vercel.live" />
        <link rel="dns-prefetch" href="//vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* ✅ PERFORMANCE: Preload critical resources */}
        {/* Next.js Font handles preloading automatically */}

        {/* ✅ PERFORMANCE: Critical CSS for hero section */}
        <style>{`
            /* Critical hero styles */
            .hero-gradient {
              background: linear-gradient(135deg, #2B2B2B 0%, #8C1F1F 50%, #2B2B2B 100%);
            }
            
            /* Critical button styles */
            .btn-primary {
              background: linear-gradient(90deg, #E03A3A 0%, #EC6A6A 100%);
            }
            
            /* Animation optimizations */
            .animate-bounce {
              animation: bounce 2s infinite;
            }
            
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>

        {/* ✅ PERFORMANCE: Inline critical CSS */}
        <style>{`
            /* Critical CSS for header and navigation */
            .nav-container { display: flex; align-items: center; justify-content: space-between; }
            .header-gradient { background: linear-gradient(135deg, #8C1F1F 0%, #2B2B2B 100%); }
            
            /* Critical typography */
            .text-gradient { background: linear-gradient(90deg, #E03A3A 0%, #EC6A6A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            
            /* Critical layout */
            .page-container { min-height: 100vh; display: flex; flex-direction: column; }
            .main-content { flex: 1; }
            
            /* Sticky navigation for better UX */
            nav.sticky-nav { position: sticky; top: 0; z-index: 100; }
            
            /* Optimized scroll behavior */
            html { scroll-behavior: smooth; scroll-padding-top: 4rem; }
          `}</style>

        {/* Note: Removed preload links that were causing warnings in development */}
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${roboto.variable} ${montserrat.variable} ${redHatDisplay.variable} ${inter.className} font-sans h-full m-0 p-0`} suppressHydrationWarning>
        <JsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />
        <ThemeProvider>
          <CriticalResourcePreloader />
          {/* <GlobalTypography /> */}
          <AppWrapper initialFooter={initialFooter}>
            {children}
          </AppWrapper>
          <Toaster />
          <DeferredAnalytics />
          <DeferredMonitoring />
          <NonCriticalScripts />
        </ThemeProvider>
      </body>
    </html>
  );
}