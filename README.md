# Solana Portfolio

A simulated Solana portfolio and a Jupiter swap quote, built with Expo Router and TypeScript. Quotes are fetched and displayed. Swaps are not executed.

## Run

```bash
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_CODEX_API_KEY` and `EXPO_PUBLIC_JUPITER_API_KEY` in `.env`. Expo inlines `EXPO_PUBLIC_*` variables when the bundle starts, so edit a key while the dev server is stopped, then start it again.

```bash
npm start
```

Tested in Expo Go on iOS. `npm run ios`, `npm run android`, and `npm run web` open one target. Quotes call `https://api.jup.ag/swap/v1/quote` with `EXPO_PUBLIC_JUPITER_API_KEY` in the `x-api-key` header.

```bash
npm test
npm run lint
npm run typecheck
```

## Layout

- `src/app/` — routes only: portfolio, swap, and token detail. They compose features and do not call fetch or GraphQL. The swap route clears the form when you leave.
- `src/domain/` — domain-specific information such as a token or network id.
- `src/api/` — Codex GraphQL, the Jupiter quote, and mock holdings. UI code uses the functions in this folder.
- `src/features/portfolio/` — the portfolio screen, which fetches and updates the user's portfolio.
- `src/features/token/` — token detail. It reads the portfolio cache, then loads that holding, price, and metadata.
- `src/features/swap/` — the swap screen: quote, token picker, and the rest of the flow, supported by a Zustand store.
- `src/components/` — shared UI: the asset row, token image, floating swap button, and the 24h chart (`TokenChart`, bar mapping, and the chart query).
- `src/ui/` — theme, color scheme, and themed text and view.
- `src/utils/` — display formatting, token-amount conversion, and shared hooks.

## State

TanStack Query is the one cache for fetched data. Holdings, portfolio prices, token metadata, the 24h chart, top tokens, and the Jupiter quote all live there, along with loading, error, stale time, and polling. Screens read that cache instead of fetching on their own. An asset row takes its price from the portfolio query. The token screen starts from that same entry and writes an updated row back.

Zustand is for UI state that is not fetched. The swap form in `src/features/swap/swapUi.ts` stores the selected tokens, the typed amounts, and which side was last edited. A new quote replaces the cached quote and leaves that draft in place.

## Library choices/Tradeoffs

- Expo Router owns navigation. Routes in `src/app/` compose the feature screens. It ships with Expo and is built on React Navigation.
- TanStack Query is the cache for fetched data. Loading, error, stale time, and polling stay on those queries. The portfolio and quotes are refreshed at configured intervals while the screen is active. Codex also offers websocket subscriptions. Polling is the smaller implementation, and there is no custom backoff.
- Zustand holds the swap form. That is a few fields of UI state. Redux would add reducers, middleware, and a larger ecosystem that this screen count does not use. On a larger app I would reach for Redux when cross-cutting flows (auth, analytics, offline queues) need that middleware layer. I would still keep fetched data in Query rather than moving prices into the store. It's still plausible to have both in a production app.
- FlashList is used for asset lists because it provides efficient list virtualization while maintaining an API similar to React Native's standard list primitives.
- `@expo/ui` provides the token picker's bottom sheet, including the web host view.
- `expo-image` expo-image provides efficient image loading and caching and works well within the Expo ecosystem.
- `react-native-gifted-charts` draws the 24h line, and the chart is the only importer. It runs in Expo Go. Victory Native is the alternative I would look at if the chart had to be shared with web.
- Codex and Jupiter are called with `fetch`. Response types sit next to those calls. The Jupiter SDK would help in a client that talks to Jupiter directly. This app would more likely put that behind an API gateway, so the SDK is unused. Query already caches token metadata. If the GraphQL surface grew, I would consider a dedicated GraphQL client and generated types rather than maintaining request and response types manually.
- Both API keys are client-visible because they are provided through EXPO_PUBLIC_* variables. A production app would call these APIs from a backend. A second price provider would fail over there too, so the client keeps one interface.
- Folders stayed within this app but separated by potential package boundaries such as `src/api`.
- Styling stays in the themed components instead of a shared design-system package. Those packages are usually company-specific and change often.
- Interactive controls include accessibility roles and labels, and the current theme colors meet WCAG AA text contrast requirements. A production implementation would add broader screen-reader, focus-order, and dynamic-type testing.

## Deferred on purpose

- A global offline banner.
- Exponential backoff when polling fails.
- Provider failover in a backend or API gateway.
- Streaming prices over Codex websockets.
- More robust top token fetching
- Gas calculations
- Swap config such as slippage
- More specific error handling
