import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Archivo, Spline_Sans_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Lee's Ranch — RRL 가격 비교 · 직구 관세 계산",
    template: "%s · Lee's Ranch",
  },
  description:
    "RRL(Double RL)을 Cultizm · Stag Provisions 등 해외 편집샵에서 원화로 실시간 비교하고, 관세·부가세·배송 포함 예상 도착가까지 계산. 아메리칸 헤리티지 디거를 위한 가격 레이더.",
  keywords: [
    "RRL",
    "Double RL",
    "RRL 가격비교",
    "RRL 직구",
    "아메리칸 캐주얼",
    "헤리티지 워크웨어",
    "셀비지 데님",
    "Cultizm",
    "Stag Provisions",
    "직구 관세 계산",
    "Ralph Lauren RRL",
  ],
  applicationName: "Lee's Ranch",
  authors: [{ name: "Lee's Ranch" }],
  creator: "Lee's Ranch",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE + "/",
    siteName: "Lee's Ranch",
    title: "Lee's Ranch — RRL 가격 비교 · 직구 관세 계산",
    description:
      "RRL을 해외 편집샵에서 원화로 비교하고 관세 포함 도착가까지. 아메리칸 헤리티지 가격 레이더.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lee's Ranch — RRL 가격 비교",
    description: "RRL 해외 편집샵 원화 가격 비교 + 직구 관세·도착가 추정.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
  verification: {
    google: "-thsPyrdMsDxJQdbeBrrt3PUIy0FHxEe0IdKs3aZDk0",
    other: {
      "naver-site-verification": "cb57197b7971eaadb9238d3ba066dac2f0de053d",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SITE + "/#website",
      url: SITE + "/",
      name: "Lee's Ranch",
      description:
        "RRL(Double RL) 해외 편집샵 원화 가격 비교 및 직구 관세·도착가 계산기.",
      inLanguage: "ko-KR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: SITE + "/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": SITE + "/#org",
      name: "Lee's Ranch",
      url: SITE + "/",
      logo: SITE + "/icon.png",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Kutoku autolinker — rewrites outbound Cultizm/Stag links into
            affiliate links. afterInteractive (not lazyOnload) so links are
            rewritten right after hydration: it's revenue-critical that a buy
            click lands on the affiliate URL, and this stays off the initial
            render path either way. */}
        <Script
          src="https://fdxtxguv.leesranch.com/0Bgsj1.js"
          data-kutoku-domain="fdxtxguv.leesranch.com"
          data-kutoku-id="0Bgsj1"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
