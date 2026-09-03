import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://arbetsformedlingen.se",
  "font-src 'self' data:",
  "connect-src 'self' https://jobsearch.api.jobtechdev.se https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/jobb/yrke/skolkurator",
        destination: "/lediga-jobb/yrke/kurator",
        permanent: true,
      },
      {
        source: "/jobb/yrke/skolkurator/:region",
        destination: "/lediga-jobb/yrke/kurator/:region",
        permanent: true,
      },
      {
        source: "/lediga-jobb/yrke/skolkurator",
        destination: "/lediga-jobb/yrke/kurator",
        permanent: true,
      },
      {
        source: "/lediga-jobb/yrke/skolkurator/:region",
        destination: "/lediga-jobb/yrke/kurator/:region",
        permanent: true,
      },
      {
        source: "/jobb",
        destination: "/lediga-jobb",
        permanent: true,
      },
      {
        source: "/jobb/:path*",
        destination: "/lediga-jobb/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
