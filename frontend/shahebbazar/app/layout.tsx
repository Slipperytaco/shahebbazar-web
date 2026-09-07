import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShahebBazar",
  description: "Vendor marketplace platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F0F2F5] text-[#1C1E21]">

        {/* Top Navigation Bar */}
        <nav className="w-full bg-[#1877F2] text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold">ShahebBazar</h1>

            <div className="flex gap-6 text-sm">
              <a href="/" className="hover:opacity-80">Home</a>
              <a href="/vendors/register" className="hover:opacity-80">Vendor Sign Up</a>
              <a href="/vendors/dashboard" className="hover:opacity-80">Vendor Dashboard</a>
              <a href="/vendors/dashboard/add-listing" className="hover:opacity-80">Add Listing</a>
              <a href="/vendors" className="hover:opacity-80">Vendors</a>
              <a href="/search" className="hover:opacity-80">Search</a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto w-full p-6">
          {children}
        </main>

      </body>
    </html>
  );
}
