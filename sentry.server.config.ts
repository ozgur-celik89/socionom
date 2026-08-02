import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "./src/lib/sentry";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
  beforeSend: scrubSentryEvent,
});

