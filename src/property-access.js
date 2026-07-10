import { init } from '@sentry/react';
const router = {};
init({ dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' });

void import('@sentry/react').then((sentry) => {
  sentry.addIntegration(sentry.tanstackRouterBrowserTracingIntegration(router));
  sentry.addIntegration(sentry.breadcrumbsIntegration({ fetch: true, history: true }));
});
