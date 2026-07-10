# rolldown-sentry-treeshake

Minimal repro showing that **destructuring a deferred `import('@sentry/react')` namespace defeats Rolldown tree-shaking**, dragging Session Replay / Feedback / AI instrumenters onto the critical path even when they're never used.

Switching the destructure to plain property access (`sentry.x`) seems to tree-shake as expected.

## Run

```bash
npm install
npm run compare
```

This builds both entries with Vite 8 (Rolldown) and prints the comparison:

```
scenario           min         gzip        replay pulled in?
------------------------------------------------------------
destructure        466.1 KB    151.6 KB    YES
property-access    144.4 KB    48.2 KB     no
------------------------------------------------------------
delta: 321.6 KB min / 103.4 KB gzip removed
       3.2x smaller by switching to property access
```

## The snippet

`src/destructure.js`: namespace is destructured:

```js
void import("@sentry/react").then((sentry) => {
  const { addIntegration, tanstackRouterBrowserTracingIntegration, breadcrumbsIntegration } =
    sentry;
  addIntegration(tanstackRouterBrowserTracingIntegration(router));
  addIntegration(breadcrumbsIntegration({ fetch: true, history: true }));
});
```

`src/property-access.js`: same code, referenced via member access, which
Rolldown seems to be able to tree-shake:

```js
void import("@sentry/react").then((sentry) => {
  sentry.addIntegration(sentry.tanstackRouterBrowserTracingIntegration(router));
  sentry.addIntegration(sentry.breadcrumbsIntegration({ fetch: true, history: true }));
});
```

## Why

Unsure, but Rolldown converts star exports using `__exportAll()` runtime helper, so this can get in the way of DCE. What is not clear is why destructuring affects the outcome.

Related upstream issues:

- https://github.com/rolldown/rolldown/issues/7874
