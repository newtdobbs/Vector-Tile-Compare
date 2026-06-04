# Vector Tile Comparison App

Compare two vector-tile-derived feature layers side-by-side as top (blue) and bottom (red) overlays, with a shared field filter and live layer swapping.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from `.env.example`:

```bash
copy .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

## Architecture

- `main.js`: bootstraps app startup and coordinates initialization steps.
- `state.js`: central in-memory app state.
- `src/stateActions.js`: narrow state transition helpers so writes are centralized.
- `src/config.js`: environment-driven runtime config and shared expression helpers.
- `src/map.js`: ArcGIS auth, group query, map construction, filter application, and layer replacement.
- `src/ui.js`: Calcite UI bindings and user interactions.

## Configuration

The app reads settings from Vite environment variables (see `.env.example`).

- `VITE_ARCGIS_APP_ID`: OAuth client ID.
- `VITE_ARCGIS_PORTAL_URL`: ArcGIS portal URL.
- `VITE_ARCGIS_GROUP_ID`: Portal group for layer discovery.
- `VITE_ARCGIS_GROUP_QUERY_LIMIT`: Max items queried from the group.
- `VITE_ARCGIS_TITLE_FILTER`: Required text in item title.
- `VITE_DEFAULT_FILTER_FIELD`: Default attribute field used for definition expressions.
- `VITE_DEFAULT_FILTER_THRESHOLD`: Threshold used in generated definition expressions.
- `VITE_FEATURE_EFFECT_THRESHOLD`: Threshold used in feature effect `where` clause.
- `VITE_BASEMAP`: Initial map basemap.
- `VITE_SYMBOL_SIZE`: Symbol size for top and bottom point renderers.
- `VITE_INITIAL_ZOOM`: Initial map zoom.

## Handoff Notes

- Layer swaps are guarded with request versions to avoid stale async operations overriding newer selections.
- UI code no longer depends on missing DOM IDs.
- Definition expressions are generated through shared config helpers rather than hardcoded strings.