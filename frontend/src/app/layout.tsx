import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const authenticSans = localFont({
  src: "./fonts/AUTHENTICSans-90.woff",
  variable: "--font-authentic-sans",
});

const authenticSansHeadings = localFont({
  src: "./fonts/AUTHENTICSans-Condensed-150.woff",
  variable: "--font-authentic-sans-headings",
});

export const metadata: Metadata = {
  title: "Sirat's CMS",
  description:
    "Sirat Baweja's personal, self-hosted, content management system. To be built with every tool she might possibly need.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${authenticSans.variable} ${authenticSansHeadings.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
