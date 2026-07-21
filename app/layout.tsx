import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import "./globals.css";

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
    google: "K7k5ZLBm4BO8nGVGPVFPPOmGL2lGvCg2P2brRU0ihRk",
    other: {
      "naver-site-verification": "95c79eb9eac53ec8802f405e115a090adb81be4e",
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
    },
    {
      "@type": "Organization",
      "@id": SITE + "/#org",
      name: "Lee's Ranch",
      url: SITE + "/",
      logo: SITE + "/icon.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
