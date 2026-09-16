import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Spatial Intelligence Platform',
  description: 'AI that understands, navigates and operates physical spaces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {}
                }
              }
            `,
          }}
        />
      </head>
      <body className="bg-slate-950 antialiased font-sans">{children}</body>
    </html>
  );
}
