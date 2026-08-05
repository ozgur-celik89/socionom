import { siteConfig } from "@/config/site";
import { FlagIcon } from "./icons";

export function ReportJobLink({
  jobId,
  jobSlug,
  jobTitle,
}: {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
}) {
  const jobUrl = `${siteConfig.url}/lediga-jobb/${jobId}/${jobSlug}`;
  const subject = encodeURIComponent(`Rapportera jobbannons ${jobId}`);
  const body = encodeURIComponent([
    "Hej,",
    "",
    "Jag vill rapportera en jobbannons som verkar vara felaktig eller inte längre aktuell.",
    "",
    `Jobb: ${jobTitle}`,
    `Annons-ID: ${jobId}`,
    `Länk: ${jobUrl}`,
    "",
    "Kommentar:",
  ].join("\n"));

  return (
    <a
      className="report-job-link"
      href={`mailto:${siteConfig.email}?subject=${subject}&body=${body}`}
    >
      <FlagIcon />
      Rapportera felaktig eller inaktuell annons
    </a>
  );
}
