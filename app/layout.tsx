import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from '@/components/ui/toaster';
import siteMetadata from '@/app/metadata.json';

import DeferredAnalytics from '@/components/DeferredAnalytics';
import DeferredMonitoring from '@/components/DeferredMonitoring';
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
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

// Limit font weights for performance



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
        
        
        
        
        
        <link rel="dns-prefetch" href="//vitals.vercel-insights.com" />
        

        {/* ✅ PERFORMANCE: Preload critical resources */}
        {/* Next.js Font handles preloading automatically */}

        {/* Note: Removed preload links that were causing warnings in development */}
      </head>
      <body className={`${inter.variable} ${inter.className} font-sans h-full m-0 p-0`} suppressHydrationWarning>
        <JsonLd data={[getOrganizationSchema(), getWebsiteSchema()]} />
        <ThemeProvider>
          {/* <GlobalTypography /> */}
          <AppWrapper initialFooter={initialFooter}>
            {children}
          </AppWrapper>
          <Toaster />
          <DeferredAnalytics />
          <DeferredMonitoring />
        </ThemeProvider>
      </body>
    </html>
  );
}