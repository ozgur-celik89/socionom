export const siteConfig = {
  name: "socionom.se",
  description:
    "Hitta lediga jobb för socionomer i hela Sverige. Sök bland jobb som socialsekreterare, kurator, biståndshandläggare och fler roller.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://socionom.se",
  email: "hej@socionom.se",
  advertisingEmail: "annonsera@socionom.se",
} as const;

export const mainNavigation = [
  { href: "/lediga-jobb", label: "Hitta jobb" },
  { href: "/#yrkesomraden", label: "Yrkesområden" },
  { href: "/om", label: "Om oss" },
] as const;
