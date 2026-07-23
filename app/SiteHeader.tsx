function timeAgoKST(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function SiteHeader({
  fxUsd,
  fxEur,
  fxChf,
  lastUpdated,
  compact,
}: {
  fxUsd: number;
  fxEur: number;
  fxChf?: number;
  lastUpdated: string | null;
  /** Smaller hero for sub-pages (product detail) — logo + ticker only. */
  compact?: boolean;
}) {
  return (
    <header className="bg-[var(--indigo-deep)] text-[#efe6d2]">
      <div className={`mx-auto max-w-6xl px-5 ${compact ? "py-5" : "pb-7 pt-9"}`}>
        <a href="/" className="flex items-center gap-3.5">
          <svg
            viewBox="0 0 100 100"
            className={compact ? "h-9 w-9 shrink-0" : "h-14 w-14 shrink-0"}
            aria-hidden="true"
          >
            <path
              d="M28.6 68 A28 28 0 1 1 71.4 68"
              fill="none"
              stroke="#efe6d2"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M50,33 L52.94,41.95 L62.4,42 L54.76,47.55 L57.6,56.5 L50,51 L42.4,56.5 L45.24,47.55 L37.6,42 L47.06,41.95 Z"
              fill="#cf9f4a"
            />
          </svg>
          <div>
            <h1
              className={`u-display font-black leading-none tracking-tight ${
                compact ? "text-xl" : "text-3xl"
              }`}
            >
              Lee&apos;s Ranch
            </h1>
            {!compact && (
              <span className="u-mono mt-1 block text-[10px] uppercase tracking-[0.32em] text-[#cf9f4a]">
                Americana · RRL price radar
              </span>
            )}
          </div>
        </a>
        {!compact && (
          <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-[#cdbf9f]">
            전 세계 편집샵의 <b className="text-[#efe6d2]">RRL(Double RL)</b>을
            원화로 비교하고, <b className="text-[#efe6d2]">관세·부가세·배송</b>까지
            얹은 <b className="text-[#efe6d2]">예상 도착가</b>를 알려드려요.
          </p>
        )}
      </div>
      {/* FX ticker */}
      <div className="border-t border-[#cf9f4a]/20 bg-black/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2 u-mono text-[11px] tracking-wide text-[#cdbf9f]">
          <span className="text-[#cf9f4a]">TODAY&apos;S RATE</span>
          <span>
            EUR <b className="text-[#efe6d2]">₩{Math.round(fxEur).toLocaleString()}</b>
          </span>
          <span>
            USD <b className="text-[#efe6d2]">₩{Math.round(fxUsd).toLocaleString()}</b>
          </span>
          {fxChf ? (
            <span>
              CHF <b className="text-[#efe6d2]">₩{Math.round(fxChf).toLocaleString()}</b>
            </span>
          ) : null}
          {lastUpdated && (
            <span className="ml-auto text-[#a99b78]">
              동기화 {timeAgoKST(lastUpdated)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
