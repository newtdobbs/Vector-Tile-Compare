import { appState } from "../state";

export function setDefaultFilterField(fieldName) {
  appState.defaultFilterField = fieldName;
}

export function setMapContext(map) {
  appState.map = map;
}

export function setTileLayers(tileLayers) {
  appState.allTileLayers = tileLayers;
}

export function setActiveLayer(layerKey, layer) {
  appState[layerKey] = layer;
}

export function setFilterField(field) {
  appState.filterField = field;
}

export function clearFilterField() {
  appState.filterField = null;
}

export function setSelectedLayerItemForTree(treeKey, layerItem) {
  appState.selectedLayerItemsByTree[treeKey] = layerItem;
}

export function nextLayerSwapVersion(layerKey) {
  appState.layerSwapRequestVersion[layerKey] += 1;
  return appState.layerSwapRequestVersion[layerKey];
}

export function isLayerSwapVersionCurrent(layerKey, version) {
  return appState.layerSwapRequestVersion[layerKey] === version;
}
