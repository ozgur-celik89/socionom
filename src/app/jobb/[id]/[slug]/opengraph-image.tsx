import { ImageResponse } from "next/og";
import { getJobById } from "@/integrations/jobtech/search";
import { brandColors, brandMarkDataUri, truncate } from "@/lib/brand";

export const alt = "Ledigt jobb på socionom.se";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string; slug: string }> };

export default async function JobOpengraphImage({ params }: Props) {
  const { id } = await params;
  const job = await getJobById(id);

  const title = truncate(job?.title ?? "Lediga jobb för socionomer", 84);
  const employer = job?.employerName ? truncate(job.employerName, 48) : "socionom.se";
  const location =
    job?.locations[0]?.municipality ?? job?.locations[0]?.region ?? (job?.remote ? "Distans" : "Sverige");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 80px",
          background: `linear-gradient(135deg, ${brandColors.shell} 0%, ${brandColors.forest} 60%, ${brandColors.shellDeep} 100%)`,
          color: brandColors.paper,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={brandMarkDataUri} width={56} height={56} />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            socionom
            <span style={{ color: brandColors.blush }}>.se</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, color: brandColors.sage }}>
            <span>{employer}</span>
            <span style={{ color: brandColors.blush }}>·</span>
            <span>{location}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              padding: "12px 26px",
              borderRadius: 999,
              background: brandColors.blush,
              color: brandColors.rose,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Ledigt jobb
          </div>
          <div style={{ display: "flex", fontSize: 24, color: brandColors.sage }}>
            Ansök via Arbetsförmedlingen
          </div>
        </div>
      </div>
    ),
    size,
  );
}
