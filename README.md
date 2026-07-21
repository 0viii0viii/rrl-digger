# DIGGING — RRL Price Radar

Double RL(RRL) 상품을 여러 헤리티지 편집샵에서 끌어와 **원화 환산 가격 비교 + 재고 확인**을 제공하는 웹앱.

현재 소스: **Cultizm**(🇩🇪 EUR) · **Stag Provisions**(🇺🇸 USD) — 둘 다 Shopify `products.json` 공개 피드 기반.
> Ralph Lauren 공홈은 봇 차단(PerimeterX)으로 자동 수집이 막혀 제외됨.

## 스택
- Next.js 15 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres, RLS 공개 읽기 전용) — 프로젝트: `kahkuma`
- 테이블: `digg_products`, `digg_sync_runs`

## 로컬 실행
```bash
npm install
npm run dev        # http://localhost:3000
```

## 데이터 갱신(수집)
`.env.local`의 `SUPABASE_SERVICE_ROLE_KEY`를 채운 뒤:
```bash
npm run sync       # 두 샵에서 RRL 상품 전량 수집 → Supabase upsert
```
크론/Vercel Cron으로 주기 실행 가능. 실시간 환율은 open.er-api.com에서 가져오며 실패 시 상수 폴백.

## 배포 (Vercel)
1. 이 폴더를 Git 저장소로 push
2. Vercel에서 import
3. 환경변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
4. Deploy

## 로드맵
- [ ] 같은 제품 정밀 매칭(스타일 코드 기반) → 스토어 간 1:1 가격 비교
- [ ] 일본 직구 총액 계산기(대행 수수료·관세·배송)
- [ ] 가격/재입고 알림
- [ ] 편집샵 추가(Self Edge, Clutch Cafe, Franklin & Poe 등)
- [ ] 어필리에이트 링크 연동(수익화)
