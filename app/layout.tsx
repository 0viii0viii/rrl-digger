import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIGGING — RRL 가격 비교",
  description:
    "Double RL(RRL) 상품을 Cultizm · Stag Provisions 편집샵에서 실시간 가격 비교. 원화 환산 + 재고 확인.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
