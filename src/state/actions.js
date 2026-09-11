import { appState } from "./store";

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

export function setSelectedTileStyle(selectedTileStyle){
  appState.selectedTileStyle = selectedTileStyle;
}

export function setAGOLGroupID(){
  appState.groupID = appState.selectedTileStyle === "EVT" ? "7818b0837c064c158b4cbf777570390d" : "be3766ac45fc4310a2e8cf12224e5618" 

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

export function setMapLOD(LOD){
  if (LOD) { appState.LOD = [LOD[0], LOD[1]] }
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

export function setTopLayer(topLayer){
  appState.topLayer = topLayer;
}

export function setBottomLayer(bottomLayer){
  appState.bottomLayer = bottomLayer;
}

export function setLayerSwapRequestVersion(topLayerVersion, bottomLayerVersion){
  appState.layerSwapRequestVersion.topLayer = topLayerVersion;
  appState.layerSwapRequestVersion.bottomLayer = bottomLayerVersion;
}

export function getDefinitionExpression() {    
  let expression = ""
  // if there is a filter field applied, we'll skip the LOD until we get the group swap working
  if (appState.filterField){
    // if (appState.LOD){
    //   expression = `${appState.filterField.name} > 0 AND (LOD >= ${appState.LOD[0]} AND LOD <= ${appState.LOD[1]})`;
    // }  
    // else {
      expression = `${appState.filterField.name} > 0`
    // }
  // } else if (appState.LOD) {
    // expression = `LOD >= ${appState.LOD[0]} AND LOD <= ${appState.LOD[1]}`;
  }
  return expression
    
}

// we do not change group ID, it will need to stay populated
export function clearStateForField(){
  appState.layerSwapRequestVersion.topLayer += 1;
  appState.layerSwapRequestVersion.bottomLayer += 1;
  setMapContext(null);
  setViewContext(null);
  setTileLayers([]);
  setFilterField(null);
  setTopLayer(null);
  console.log('Resetting map LOD')
  setMapLOD(null);
  console.log('Map LOD is now', appState.LOD)
  setBottomLayer(null);
  setSelectedLayerItemForTree("top", null);
  setSelectedLayerItemForTree("bottom", null);
  setFilterField(appState.defaultFilterField);
}