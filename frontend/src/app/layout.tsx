import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const authenticSans = localFont({
  src: "./fonts/AUTHENTICSans-90.woff",
  variable: "--authentic-sans",
});

const authenticSansHeadings = localFont({
  src: "./fonts/AUTHENTICSans-Condensed-150.woff",
  variable: "--authentic-sans-condensed",
});

export const metadata: Metadata = {
  title: "Sirat's CMS",
  description:
    "Sirat Baweja's personal, self-hosted, content management system. To be built with every tool she might possibly need.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body
        className={`${authenticSans.variable} ${authenticSansHeadings.variable} antialiased flex flex-col container mx-auto justify-center items-center justify-items-center min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
