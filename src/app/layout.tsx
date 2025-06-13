"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { StrictMode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <title>AVN Gerenciador</title>
        <meta name="description" content="Sistema de gerenciamento de consultores entre projetos" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50`}>
        <StrictMode>
          {children}
        </StrictMode>
      </body>
    </html>
  );
}
