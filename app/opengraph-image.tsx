import { ImageResponse } from "next/og";

export const alt = "Lee's Ranch — RRL price comparison for Korean collectors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share card (English only — the default font has no Korean glyphs).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#26374d",
          color: "#f0e6d2",
        }}
      >
        <svg width="190" height="190" viewBox="0 0 100 100">
          <path
            d="M28.6 68 A28 28 0 1 1 71.4 68"
            fill="none"
            stroke="#f0e6d2"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M50,33 L52.94,41.95 L62.4,42 L54.76,47.55 L57.6,56.5 L50,51 L42.4,56.5 L45.24,47.55 L37.6,42 L47.06,41.95 Z"
            fill="#cf9f4a"
          />
        </svg>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: 2, marginTop: 20 }}>
          LEE&apos;S RANCH
        </div>
        <div style={{ fontSize: 30, color: "#cf9f4a", letterSpacing: 8, marginTop: 8 }}>
          RRL · AMERICANA PRICE RADAR
        </div>
        <div style={{ fontSize: 26, color: "#c9b78d", marginTop: 22 }}>
          Compare boutiques · KRW landed cost with duty &amp; VAT
        </div>
      </div>
    ),
    { ...size },
  );
}
