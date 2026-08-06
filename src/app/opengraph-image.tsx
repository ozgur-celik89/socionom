import { ImageResponse } from "next/og";
import { brandColors, brandMarkDataUri } from "@/lib/brand";

export const alt = "socionom.se – lediga jobb för socionomer i hela Sverige";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          background: `linear-gradient(135deg, ${brandColors.shell} 0%, ${brandColors.forest} 55%, ${brandColors.shellDeep} 100%)`,
          color: brandColors.paper,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={brandMarkDataUri} width={72} height={72} />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            socionom
            <span style={{ color: brandColors.blush }}>.se</span>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 110, fontSize: 84, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
          Lediga jobb för socionomer i hela Sverige
        </div>
      </div>
    ),
    size,
  );
}
