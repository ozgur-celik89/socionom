import type { ErrorEvent } from "@sentry/core";

export function scrubSentryEvent(event: ErrorEvent) {
  delete event.user;

  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.headers;
    delete event.request.query_string;

    if (event.request.url) {
      try {
        const url = new URL(event.request.url);
        url.search = "";
        event.request.url = url.toString();
      } catch {
        event.request.url = event.request.url.split("?")[0];
      }
    }
  }

  return event;
}
