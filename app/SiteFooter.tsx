export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl space-y-1 border-t border-[var(--line)] px-5 py-8 text-center text-[11px] leading-relaxed text-[var(--muted)]">
      <p>
        표시 가격은 <b>중간환율 기준 참고가</b>예요. 실제 결제는 카드사 환율·
        수수료, 각 샵 환전 마진으로 <b>조금 다를 수 있어요.</b>
      </p>
      <p>
        관세는 <b>자가사용 직구 추정치</b>입니다 — 의류 관세 13% + 부가세 10%,
        면세 한도 미국(Stag) $200 / 기타(Cultizm·DeeCee) $150. 배송비는 <b>주문당
        추정</b>(Stag $50 · Cultizm €36 · DeeCee는 주문액별 9~34 CHF) — 여러 개
        함께 사면 나눠져서 실제 개당 비용은 더 낮아져요. HS코드·실제 배송비에
        따라 달라집니다.
      </p>
      <p>가격·재고는 각 편집샵 피드 기준 · 구매 전 원 사이트에서 확인하세요.</p>
      <p className="pt-1 text-[var(--ink)]/70">
        <b>제휴 공지:</b> 파트너 편집샵 링크를 통해 발생한 구매에 대해{" "}
        <b>Lee&apos;s Ranch가</b> 소정의 수수료를 받을 수 있습니다. 구매자가
        내시는 금액에는 영향이 없습니다(추가 부담 없음).
      </p>
      <p className="text-stone-400">
        Lee&apos;s Ranch는 Ralph Lauren · RRL(Double RL)과 제휴·후원·보증
        관계가 없는 독립 가격비교 서비스입니다. 모든 상표와 상품 이미지의
        권리는 각 소유자에게 있습니다.
      </p>
    </footer>
  );
}
