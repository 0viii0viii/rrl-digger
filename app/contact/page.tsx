import type { Metadata } from "next";
import ContentShell from "../ContentShell";
import { Section, P, UL } from "../prose";

export const revalidate = 86400;

const EMAIL = "leesranchcom@gmail.com";

export const metadata: Metadata = {
  title: "문의하기",
  description:
    "Lee's Ranch에 제휴 제안, 상품·가격 오류 제보, 편집샵 추가 요청 등을 문의하세요.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <ContentShell
      title="문의하기"
      intro="궁금한 점이나 제안이 있으면 편하게 연락 주세요. 최대한 빠르게 답변드릴게요."
    >
      <Section title="이메일">
        <P>
          아래 주소로 메일 주시면 돼요.
        </P>
        <a
          href={`mailto:${EMAIL}`}
          className="u-mono inline-block border border-[var(--line-strong)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--indigo)] hover:border-[var(--indigo)]"
        >
          {EMAIL}
        </a>
      </Section>

      <Section title="이런 문의를 환영해요">
        <UL
          items={[
            <><b>제휴·비즈니스 제안</b> — 편집샵/브랜드 협업</>,
            <><b>오류 제보</b> — 잘못된 가격·재고·링크·번역</>,
            <><b>편집샵 추가 요청</b> — 비교에 넣었으면 하는 RRL 취급 샵</>,
            <>기타 서비스 관련 의견</>,
          ]}
        />
      </Section>
    </ContentShell>
  );
}
