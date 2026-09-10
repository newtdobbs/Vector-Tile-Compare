// the dictionary which will represent the current state of the app 
export const appState = {
  map: null,
  view: null,
  allTileLayers: [],
  appId: 'LZ49XhZatXR6WAJO',
  portalUrl: "https://arcgis-content.maps.arcgis.com",
  flowType: "auto",
  popup: false,
  selectedTileStyle: "EVT", // this can be EVT or OBM
  groupID: "7818b0837c064c158b4cbf777570390d",
  maxItems: 20,
  requiredTitleText: "Esri Vector Basemap Tile Statistics",
  defaultFilterField: "Building",
  defaultFilterThreshold: 0,
  featureEffectThreshold: 40000,
  minLOD: 0, 
  maxLOD: 16,
  basemap: "dark-gray-vector", 
  symbolSize: 5,
  initialCenter: [137.421641, 35.918028],
  initialZoom: 6,
  filterField: null,
  LODRange: [0, 16],
  topLayer: null,
  bottomLayer: null,
  selectedLayerItemsByTree: {
    top: null,
    bottom: null
  },
  layerSwapRequestVersion: {
    topLayer: 0,
    bottomLayer: 0
  }
};