function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// freezing the config for immutability
export const APP_CONFIG = Object.freeze({
  oauth: {
    appId: import.meta.env.VITE_ARCGIS_APP_ID ?? "LZ49XhZatXR6WAJO",
    portalUrl:
      import.meta.env.VITE_ARCGIS_PORTAL_URL ?? "https://arcgis-content.maps.arcgis.com",
    flowType: "auto",
    popup: false,
  },
  groupQuery: {
    groupId: import.meta.env.VITE_ARCGIS_GROUP_ID ?? "7818b0837c064c158b4cbf777570390d",
    maxItems: parseNumber(import.meta.env.VITE_ARCGIS_GROUP_QUERY_LIMIT, 20),
    requiredTitleText:
      import.meta.env.VITE_ARCGIS_TITLE_FILTER ?? "Esri Vector Basemap Tile Statistics",
  },
  filters: {
    defaultField: import.meta.env.VITE_DEFAULT_FILTER_FIELD ?? "Building",
    defaultThreshold: parseNumber(import.meta.env.VITE_DEFAULT_FILTER_THRESHOLD, 0),
    featureEffectThreshold: parseNumber(import.meta.env.VITE_FEATURE_EFFECT_THRESHOLD, 40000),
  },
  map: {
    basemap: import.meta.env.VITE_BASEMAP ?? "dark-gray-vector",
    symbolSize: parseNumber(import.meta.env.VITE_SYMBOL_SIZE, 5),
    initialCenter: [137.421641, 35.918028],
    initialZoom: parseNumber(import.meta.env.VITE_INITIAL_ZOOM, 6),
  },
});

export function getDefinitionExpression(fieldName) {
  return `${fieldName} > ${APP_CONFIG.filters.defaultThreshold}`;
}