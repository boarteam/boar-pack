# @boarteam/boar-pack-liquidity-monitor-frontend

[![npm version](https://img.shields.io/npm/v/@boarteam/boar-pack-liquidity-monitor-frontend.svg)](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-frontend)
[![license](https://img.shields.io/npm/l/@boarteam/boar-pack-liquidity-monitor-frontend.svg)](https://github.com/boarteam/boar-pack/blob/master/LICENSE)

React (Ant Design) dashboard components for
[`@boarteam/boar-pack-liquidity-monitor-backend`](https://www.npmjs.com/package/@boarteam/boar-pack-liquidity-monitor-backend):
per-provider quote-flow sparkline cards, stacked timelines with drill-down,
and per-user/target connection statistics — plus a typed OpenAPI client for
the backend's endpoints.

Part of the [boar-pack](https://github.com/boarteam/boar-pack) monorepo.

## What's inside

- `QuotesStatisticCards` — a card per liquidity provider with a live
  sparkline of the last hour of quote counts (`updateInterval` enables
  auto-refresh) and an Enabled/Disabled tag.
- `QuotesStatisticTimeline` — stacked column chart of quote counts over
  time, colored by provider; clicking a bar calls `onDateRangeChange` for
  drill-down.
- `UsersConnectionsStatisticCards` / `TargetsConnectionsStatisticCards` —
  per-user / per-target connection throughput cards.
- `UsersConnectionsStatisticTimeline` — stacked timeline by connection
  target with drill-down.
- `createApiClient(config?)` — builds the generated `ApiClient`
  (`BASE` defaults to `/api`; supports `TOKEN`, cookie credentials, custom
  headers). Services: `quotesStatistics`, `usersConnectionsStatistic`.
- `ApiClientProvider` / `useApiClient` — React context that hands the
  client to the components above.

## Install

```bash
yarn add @boarteam/boar-pack-liquidity-monitor-frontend
```

Peer dependencies: `react` 18, `react-dom`, `antd` 5,
`@ant-design/pro-components` / `pro-table` / `pro-utils` / `icons`,
`react-intl`. Charts come via `@ant-design/plots` (a direct dependency).

Host notes:

- The **Cards** components and the API client are plain React — they work
  in any app wrapped in `ApiClientProvider`.
- The **Timeline** components read the antd theme from umi's
  `useModel('@@initialState')` (`settings.navTheme`), so they need a
  umi 4 / `@umijs/max` host with the model plugin and an initial state
  providing `settings.navTheme`.
- `UsersConnectionsStatisticCards` links each user card to
  `/admin/users/<id>` via `react-router-dom`, so a router context is
  required there.

## Usage

```tsx
import {
  createApiClient,
  ApiClientProvider,
  QuotesStatisticCards,
} from '@boarteam/boar-pack-liquidity-monitor-frontend';

// Cookie-based auth by default; pass TOKEN for bearer auth.
const apiClient = createApiClient({ BASE: '/api' });

export default function ProvidersDashboard() {
  // TStatisticProvider[]: your list of providers to display
  const providers = [{ id: 'lp-1', name: 'LP One', enabled: true }];

  return (
    <ApiClientProvider value={apiClient}>
      <QuotesStatisticCards providers={providers} updateInterval={5000} />
    </ApiClientProvider>
  );
}
```

The components fetch data themselves through the provided client
(`quotesStatistics.getTimeline(…)` etc.) — point `BASE` at an app that
registered the backend's modules.

## Stability

Beta. Extracted from production systems and used in real projects, but the
public API surface is still being curated — expect breaking changes between
major versions. Maintained on a best-effort basis; see the
[monorepo README](https://github.com/boarteam/boar-pack#versioning--stability)
for the versioning policy.

## License

[MIT](https://github.com/boarteam/boar-pack/blob/master/LICENSE)
