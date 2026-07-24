import type { Metadata } from "next";
import ContentShell from "../ContentShell";
import { Section, P, UL, Panel, Note } from "../prose";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "RRL 취급 해외 편집샵 정보 — Cultizm · Stag · DeeCee",
  description:
    "Lee's Ranch가 비교하는 RRL(Double RL) 해외 편집샵 3곳을 정리했어요. Cultizm(독일), Stag Provisions(미국), DeeCee(스위스)의 통화·배송 정책·면세 한도·특징을 한눈에 비교하세요.",
  alternates: { canonical: "/shops" },
};

export default function ShopsPage() {
  return (
    <ContentShell
      title="RRL 취급 해외 편집샵 정보"
      intro="Lee's Ranch가 가격을 비교하는 세 편집샵이에요. 나라·통화·배송 정책이 달라서 같은 상품이라도 도착가가 꽤 달라져요."
    >
      <Section title="Cultizm 🇩🇪 — 독일 뮌헨">
        <P>
          유럽을 대표하는 아메리칸 헤리티지·셀비지 데님 편집샵이에요. RRL 물량과
          사이즈 폭이 넓고, 세일·쿠폰 프로모션이 비교적 자주 있어요.
        </P>
        <Panel label="직구 포인트">
          <UL
            items={[
              <>결제 통화: <b>유로(EUR)</b></>,
              <>
                <b>수출 시 VAT(19%) 환급</b> — EU 밖(한국)으로 배송하면 부가세가
                빠져요. 그래서 이 사이트의 표기가는 VAT를 뺀 실제 결제 예상가예요.
              </>,
              <>한국 배송비: 주문당 <b>약 €36</b> (정책상 €25부터)</>,
              <>면세 한도: <b>$150</b></>,
            ]}
          />
        </Panel>
      </Section>

      <Section title="Stag Provisions 🇺🇸 — 미국 텍사스 오스틴">
        <P>
          미국 남부의 감각 있는 남성복 편집샵이에요. RRL을 포함해 아메리카나
          브랜드를 폭넓게 다뤄요.
        </P>
        <Panel label="직구 포인트">
          <UL
            items={[
              <>결제 통화: <b>달러(USD)</b></>,
              <>
                표시가는 <b>세전 가격</b>이에요(미국은 결제 시 주(州) 판매세가
                붙지만, 해외 배송은 면제).
              </>,
              <>한국 배송비: 주문당 <b>약 $50</b> (DHL 익스프레스)</>,
              <>
                면세 한도: <b>$200</b> — 한·미 FTA로 다른 나라(150달러)보다 높아요.
              </>,
            ]}
          />
        </Panel>
      </Section>

      <Section title="DeeCee 🇨🇭 — 스위스 취리히">
        <P>
          웨스턴·헤리티지 무드의 큐레이션 편집샵이에요. 매장 분위기가 나무·빈티지
          톤으로 감각적이고, RRL 셀렉션이 알차요.
        </P>
        <Panel label="직구 포인트">
          <UL
            items={[
              <>결제 통화: <b>스위스 프랑(CHF)</b></>,
              <>
                스위스는 EU가 아니라 <b>수출 시 VAT 환급이 없어요</b> — 표기가가
                곧 결제가에 가까워요.
              </>,
              <>
                한국 배송비: <b>주문 금액이 클수록 저렴</b>해지는 슬라이딩
                방식이에요 (약 34 → 29 → 19 → 9 CHF).
              </>,
              <>면세 한도: <b>$150</b></>,
            ]}
          />
        </Panel>
      </Section>

      <Note>
        가격·재고·배송 정책은 각 편집샵 사정에 따라 바뀔 수 있어요. 결제 전 반드시
        해당 편집샵 사이트에서 최신 정보를 확인하세요. Lee's Ranch는 이들
        편집샵과 독립적인 가격비교 서비스이며, 일부 링크는 제휴(어필리에이트)
        링크예요.
      </Note>
    </ContentShell>
  );
}
