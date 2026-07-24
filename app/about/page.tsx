import type { Metadata } from "next";
import ContentShell from "../ContentShell";
import { Section, P, UL, Note } from "../prose";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "소개 — Lee's Ranch는 어떤 서비스인가요",
  description:
    "Lee's Ranch는 RRL(Double RL)을 해외 편집샵에서 원화로 비교하고, 관세·부가세·배송까지 얹은 예상 도착가를 알려주는 독립 가격비교 서비스예요. 데이터가 어떻게 모이고 가격이 어떻게 계산되는지 소개합니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentShell
      title="Lee's Ranch 소개"
      intro="RRL(Double RL) 하나를 사더라도 어느 편집샵이, 관세까지 붙이면 진짜로 얼마인지 — 그걸 한눈에 보여주려고 만들었어요."
    >
      <Section title="무엇을 하는 서비스인가요">
        <P>
          Lee's Ranch는 전 세계 해외 편집샵이 취급하는{" "}
          <b>RRL(Double RL) 상품의 가격을 원화로 비교</b>하고, 여기에{" "}
          <b>관세·부가세·배송비를 얹은 예상 도착가</b>까지 계산해 보여주는 독립
          가격비교 서비스예요. "직구하면 결국 얼마인지"를 상품마다 바로 확인할 수
          있어요.
        </P>
      </Section>

      <Section title="가격은 어떻게 모이나요">
        <UL
          items={[
            <>
              각 편집샵이 공개하는 상품 피드에서 <b>상품·가격·재고를 주기적으로
              수집</b>해요(약 6시간 간격).
            </>,
            <>
              현지 통화 가격을 <b>중간환율</b>로 원화 환산하고, 유럽 편집샵은{" "}
              <b>수출 VAT 환급</b>을 반영한 실제 결제 예상가로 보정해요.
            </>,
            <>
              여기에 <b>한국 직구 기준 관세·부가세·배송비를 추정</b>해 예상
              도착가를 만들어요. 계산 방식은{" "}
              <a
                href="/guide/customs"
                className="text-[var(--indigo)] underline underline-offset-2"
              >
                관세 가이드
              </a>
              에서 자세히 볼 수 있어요.
            </>,
          ]}
        />
        <Note>
          표시 가격과 도착가는 모두 <b>참고용 추정치</b>예요. 실제 결제 금액은
          카드사 환율·수수료, 각 편집샵 정책, 세관 판단에 따라 달라질 수 있으니
          구매 전 원 사이트에서 확인하세요.
        </Note>
      </Section>

      <Section title="독립성과 제휴 안내">
        <UL
          items={[
            <>
              Lee's Ranch는 <b>Ralph Lauren · RRL(Double RL)과 제휴·후원·보증
              관계가 없는</b> 독립 서비스예요. 모든 상표와 상품 이미지의 권리는 각
              소유자에게 있습니다.
            </>,
            <>
              사이트의 일부 편집샵 링크는 <b>제휴(어필리에이트) 링크</b>예요. 이
              링크를 통한 구매에 대해 Lee's Ranch가 소정의 수수료를 받을 수
              있지만, <b>구매자가 내는 금액에는 영향이 없어요</b>(추가 부담 없음).
            </>,
          ]}
        />
      </Section>

      <Section title="문의">
        <P>
          제휴 제안, 오류 제보, 기타 문의는{" "}
          <a
            href="/contact"
            className="text-[var(--indigo)] underline underline-offset-2"
          >
            문의 페이지
          </a>
          를 확인해 주세요.
        </P>
      </Section>
    </ContentShell>
  );
}
