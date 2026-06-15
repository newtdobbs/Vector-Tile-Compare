// the dictionary which will represent the current state of the app 
export const appState = {
  map: null,
  view: null,
  allTileLayers: [],
  defaultFilterField: "Building",
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