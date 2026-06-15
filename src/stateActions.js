import { appState } from "../state";

export function setDefaultFilterField(fieldName) {
  appState.defaultFilterField = fieldName;
}

export function setMapContext(map) {
  appState.map = map;
}

export function setViewContext(view) {
  appState.view = view;
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

export function setMapLOD(minLOD, maxLOD){
  appState.LODRange = [minLOD, maxLOD]
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

export function getDefinitionExpression() {
  // if there is a filter field applied
  if (appState.filterField){
    return `${appState.filterField.name} > 0 AND (LOD >= ${appState.LODRange[0]} AND LOD <= ${appState.LODRange[1]})`;
  // otherwise there is no filter field applied, so we only use the LOD range for the definition expression
  } else {
    return `LOD >= ${appState.LODRange[0]} AND LOD <= ${appState.LODRange[1]}`;
  }
}
