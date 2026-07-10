import { init } from '@sentry/react';
const router = {};
init({ dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' });

void import('@sentry/react').then((sentry) => {
  const {
    addIntegration,
    tanstackRouterBrowserTracingIntegration,
    breadcrumbsIntegration,
  } = sentry;
  addIntegration(tanstackRouterBrowserTracingIntegration(router));
  addIntegration(breadcrumbsIntegration({ fetch: true, history: true }));
});
