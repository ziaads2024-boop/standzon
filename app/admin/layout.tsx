import React from 'react';
import './admin.css';
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap" rel="stylesheet" />
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </>
  );
}
