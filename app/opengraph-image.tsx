import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bloomrose Accesorios · Bisutería artesanal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 100px",
          background:
            "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 45%, #fbcfe8 100%)",
          fontFamily: "serif",
          color: "#1f1715",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(244,114,182,0.45), rgba(244,114,182,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 60% 60%, rgba(251,191,36,0.35), rgba(251,191,36,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#be185d",
            }}
          />
          <span
            style={{
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#9d174d",
              fontFamily: "sans-serif",
            }}
          >
            Hecho en Colombia
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 156,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: -4,
            }}
          >
            Bloomrose
          </div>
          <div
            style={{
              fontSize: 44,
              fontFamily: "sans-serif",
              color: "#4a2a36",
              maxWidth: 880,
              lineHeight: 1.2,
            }}
          >
            Bisutería artesanal — aretes, collares, pulseras y anillos con
            envíos a todo el país.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "sans-serif",
            fontSize: 26,
            color: "#7a3a52",
          }}
        >
          <span>bloomroseaccesorios.com</span>
          <span>@bloomrose.store</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
