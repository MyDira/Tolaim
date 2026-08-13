import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRabbis } from "@/lib/data";
import { MyRabbiProvider } from "@/lib/my-rabbi";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tolaim — insect inspection in fruit and vegetables",
    template: "%s · Tolaim",
  },
  description:
    "Look up any fruit, vegetable or herb and find out whether it needs checking for insects, how serious it is, and what to do before you eat it.",
  openGraph: {
    type: "website",
    siteName: "Tolaim",
    title: "Tolaim — insect inspection in fruit and vegetables",
    description: "Whether it needs checking, how serious it is, and what to do about it.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Rabbis are a short, fully public list. Loading them once here means the
  // "my rabbi" resolution is instant on every page with no further requests.
  const rabbis = await getRabbis();

  return (
    <html lang="en" className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <MyRabbiProvider rabbis={rabbis}>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </MyRabbiProvider>
      </body>
    </html>
  );
}
