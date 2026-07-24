import type { Metadata } from "next";
import ContentShell from "../../ContentShell";
import { Section, P, UL, Panel, Note } from "../../prose";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "해외직구 관세·부가세 계산 가이드",
  description:
    "미국·유럽 해외직구 관세와 부가세를 쉽게 정리했어요. 목록통관 면세 한도($150 / 미국 $200), 의류 관세율 13%, 부가세 10%, 과세가격 계산법과 예시까지 — RRL 직구 도착가가 어떻게 나오는지 알려드려요.",
  alternates: { canonical: "/guide/customs" },
};

export default function CustomsGuide() {
  return (
    <ContentShell
      title="해외직구 관세·부가세 가이드"
      intro="RRL을 해외 편집샵에서 직구할 때 붙는 세금이 어떻게 계산되는지, 그리고 Lee's Ranch의 '예상 도착가'가 어떤 기준으로 나오는지 정리했어요."
    >
      <Section title="면세 한도부터 — 얼마까지 세금이 없나">
        <P>
          개인이 자가사용 목적으로 직구할 때는 <b>물품가격</b> 기준으로 일정
          금액까지 세금이 면제돼요. 이걸 목록통관 면세 한도라고 해요.
        </P>
        <UL
          items={[
            <>
              <b>미국 발송: $200</b> — 한·미 FTA 덕분에 다른 나라보다 한도가
              높아요. (Stag Provisions가 여기 해당)
            </>,
            <>
              <b>그 외 국가: $150</b> — 유럽·스위스 등. (Cultizm 🇩🇪 · DeeCee 🇨🇭)
            </>,
            <>
              한도는 <b>물품 가격만</b>으로 따져요 — 배송비는 이 판단에서
              제외돼요.
            </>,
          ]}
        />
        <Note>
          면세 한도를 <b>넘으면</b> 넘은 금액이 아니라 <b>전체 금액</b>에 대해
          세금이 붙어요. 예를 들어 $151짜리(미국 외)는 $1이 아니라 $151 전체가
          과세 대상이 돼요.
        </Note>
      </Section>

      <Section title="한도를 넘으면 — 이렇게 계산돼요">
        <P>
          면세 한도를 초과하면 관세와 부가세가 순서대로 붙어요. 기준이 되는{" "}
          <b>과세가격</b>은 물품 가격에 배송비를 더한 값이에요.
        </P>
        <Panel label="계산 순서">
          <P>
            <b>① 과세가격</b> = 물품 가격 + 배송비
          </P>
          <P>
            <b>② 관세</b> = 과세가격 × 관세율 <span className="text-[var(--muted)]">(의류 13%)</span>
          </P>
          <P>
            <b>③ 부가세</b> = (과세가격 + 관세) × 10%
          </P>
          <P className="pt-1 border-t border-dashed border-[var(--line-strong)]">
            <b>최종 세금</b> = 관세 + 부가세
          </P>
        </Panel>
        <UL
          items={[
            <>
              <b>관세율은 품목마다 달라요.</b> 의류는 보통 13%지만, 신발·가방·
              액세서리는 HS코드에 따라 다른 세율이 적용돼요. Lee's Ranch는 의류
              기준(13%)으로 추정해요.
            </>,
            <>
              <b>부가세 10%</b>는 대부분의 품목에 공통으로 붙어요.
            </>,
          ]}
        />
      </Section>

      <Section title="예시로 보기">
        <P>
          유럽 편집샵(면세 한도 $150)에서 <b>물품 ₩300,000 + 배송비 ₩60,000</b>
          짜리 데님을 산다고 가정해볼게요. (환율 $1 = ₩1,400 가정 → 물품가 약
          $214로 한도 초과)
        </P>
        <Panel label="예상 세금">
          <P>과세가격 = 300,000 + 60,000 = <b>₩360,000</b></P>
          <P>관세(13%) = 360,000 × 0.13 = <b>₩46,800</b></P>
          <P>부가세(10%) = (360,000 + 46,800) × 0.1 = <b>₩40,680</b></P>
          <P className="pt-1 border-t border-dashed border-[var(--line-strong)]">
            세금 합계 = <b>약 ₩87,480</b> · 도착가 = 물품 + 배송 + 세금 ={" "}
            <b className="text-[var(--indigo)]">약 ₩447,480</b>
          </P>
        </Panel>
      </Section>

      <Section title="꼭 알아두면 좋은 것">
        <UL
          items={[
            <>
              <b>개인통관고유부호</b>가 필요해요 — 관세청 홈페이지/앱에서 무료로
              발급받아 결제 시 입력하면 통관이 매끄러워요.
            </>,
            <>
              <b>합산과세</b> — 같은 날, 같은 사람에게 여러 건이 도착하면 합쳐서
              한도를 따질 수 있어요. 나눠 주문했어도 도착일이 겹치면 합산될 수
              있어요.
            </>,
            <>
              <b>세관 적용 환율은 주간 고시환율</b>이에요. 결제 시점 환율이나 이
              사이트의 중간환율과는 조금 달라서, 실제 세금은 추정치와 차이가 날 수
              있어요.
            </>,
            <>
              여러 개를 <b>한 번에 주문</b>하면 배송비가 나눠져서 개당 도착가가
              낮아져요. 이 사이트는 각 상품을 1개 단독 구매 기준으로 추정해요.
            </>,
          ]}
        />
        <Note>
          여기 계산은 모두 <b>추정치</b>예요. 정확한 세액은 품목의 HS코드와
          세관의 실제 판단에 따라 달라지니, 참고용으로만 활용하세요.
        </Note>
      </Section>
    </ContentShell>
  );
}
