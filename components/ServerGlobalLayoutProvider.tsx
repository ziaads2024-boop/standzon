'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { generateBreadcrumbs } from '@/lib/utils/breadcrumbUtils';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ClientNavigationWrapper from '@/components/ClientNavigationWrapper';

interface ServerGlobalLayoutProviderProps {
  children: React.ReactNode;
  initialFooter?: any;
}

/**
 * Client-side layout provider that conditionally renders the public site shell.
 * It detects admin routes and skips the public header/footer/breadcrumbs.
 */
export default function ServerGlobalLayoutProvider({ children, initialFooter }: ServerGlobalLayoutProviderProps) {
  const pathname = usePathname();
  console.log('ServerGlobalLayoutProvider pathname:', pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate isAdmin synchronously to avoid flicker/stale state
  const isAdmin = !!pathname && (
    pathname === '/admin' || 
    pathname.startsWith('/admin/') || 
    pathname.startsWith('admin/')
  );

  // If we're on an admin page, we just render the children.
  // The AdminLayoutWrapper (inside app/admin/layout.tsx) handles the admin shell.
  if (isAdmin) {
    return <>{children}</>;
  }

  // Location pages (/exhibition-stands/<country> or /<country>/<city>) carry their
  // own breadcrumb inside the hero banner instead — a second, fixed one stacked
  // under the site nav read as clutter (and doubled up in full-page screenshots).
  // The bare /exhibition-stands directory index has no banner, so it keeps this one.
  const isLocationPage = !!pathname && /^\/exhibition-stands\/[^/]+(\/[^/]+)?$/.test(pathname);
  const showBreadcrumbs = pathname !== '/' && !pathname?.startsWith('/debug') && !isLocationPage;
  const breadcrumbs = pathname ? generateBreadcrumbs(pathname) : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 
        Note: ClientNavigationWrapper contains Navigation.
        If a page also renders Navigation, it will be duplicated.
        However, for SEO, we want Navigation to be consistent.
      */}
      <ClientNavigationWrapper 
        pathname={pathname || '/'} 
        showBreadcrumbs={mounted && showBreadcrumbs} 
        breadcrumbs={breadcrumbs} 
      />

      <main className="flex-grow">
        {children}
      </main>
      
      {mounted && (
        <>
          <Footer initialFooter={initialFooter} />
          <WhatsAppFloat />
        </>
      )}
    </div>
  );
}