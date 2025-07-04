import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Pool } from 'pg';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const connectionString = process.env.DATABASE_URL || 'postgresql://handle_me_user:handle_me_password@localhost:5432/handle_me_db';

const pool = new Pool({
  connectionString,
  ssl: false
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
