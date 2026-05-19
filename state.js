export const appState = {
  map: null,
  layerDefinitionExpressions: [],
  activeDefinitionExpression: null,
  activeDefinitionExpressionField: null,
  allTileLayers: [],
  defaultFilterField: 'Building',
  filterField: null,
  activeWidget: "fields-list", // we'll use the fields list as the default action
  activeFeatureLayers: [],
  topLayer: null,
  topRenderer: null, // the renderer for the top (BLUE) layer,
  bottomLayer: null,
  bottomRenderer: null, // the renderer for the bottom (RED) layer
}