import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Product Admin Dashboard | Manage Catalog',
  description: 'Enterprise Product Management Dashboard built with Next.js, React, Tailwind CSS, and Axios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${inter.className} min-h-full flex flex-col text-slate-900 antialiased`}>
        <AuthProvider>
          <ProductProvider>{children}</ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
