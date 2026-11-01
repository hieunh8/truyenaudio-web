import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/config";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import Player from "@/components/Player";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BottomNav from "@/components/BottomNav";
import UmamiScript from "@/components/UmamiScript";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND_NAME} - ${BRAND_TAGLINE}`, template: `%s | ${BRAND_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    locale: "vi_VN",
    title: BRAND_NAME,
    description: SITE_DESCRIPTION,
  },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
    { media: "(prefers-color-scheme: light)", color: "#F6F1E7" },
  ],
};

// Runs before first paint so the saved theme never flashes.
const THEME_SCRIPT = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('truyenaudio:theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col pb-[calc(var(--nav-h)+var(--player-h))] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-3 focus:font-semibold focus:text-accent-fg"
        >
          Bỏ qua, đến nội dung chính
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
        <SiteFooter />
        <BottomNav />
        <Player />
        <UmamiScript />
      </body>
    </html>
  );
}
