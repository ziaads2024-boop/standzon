'use client';

import React from 'react';
import ServerGlobalLayoutProvider from './ServerGlobalLayoutProvider';

export default function AppWrapper({ children, initialFooter }: { children: React.ReactNode; initialFooter?: any }) {
  // pathname is now handled internally by ServerGlobalLayoutProvider
  return <ServerGlobalLayoutProvider initialFooter={initialFooter}>{children}</ServerGlobalLayoutProvider>;
}