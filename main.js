import "@arcgis/map-components/components/arcgis-layer-list";
const Map = await $arcgis.import("@arcgis/core/Map.js");
const MapView = await $arcgis.import("@arcgis/core/views/MapView.js");
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");
const WebMap = await $arcgis.import("@arcgis/core/WebMap.js");
const FeatureEffect = await $arcgis.import("@arcgis/core/layers/support/FeatureEffect.js");
import "./style.css";


/* 
DOM ELEMENTS
*/
const mapEl = document.getElementById("mapEl");
const fieldsList = document.getElementById("fields-list");
const layerList = document.getElementById("layer-list");

/* 
CONSTANTS
*/
const appState = {
  webMap: null,
  layerDefinitionExpressions: [],
  activeDefinitionExpression: null,
  activeDefinitionExpressionField: null,
  featureLayers: [],
  bottomRenderer: null, // the renderer for the bottom (RED) layer
  topRenderer: null // the renderer for the top (RED) layer
}
// fields to ignore listed by NAME not alias
const ignoreFields = [
  "OBJECTID",
  "LOD",
  "ROW",
  "COL",
  "LEAF",
  "SIZE",
  "x",
  "y",
  "UniqueID"
]
let activeWidget;

mapEl.addEventListener("arcgisViewReadyChange", () => {
  const { title, thumbnailUrl, snippet, modified, tags } = mapEl.map.portalItem;
  document.getElementById("app-heading").heading = "Vector Tile Compare";
  document.getElementById("card-heading").innerHTML = title;
  document.getElementById("card-thumbnail").src = thumbnailUrl;
  document.getElementById("card-description").innerHTML = `<p>${snippet}</p><p>Last modified on ${modified}.</p>`;
  document.getElementById("app-heading").removeAttribute("hidden");
});

const handleActionBarClick = ({ target }) => {
  if (target.tagName !== "CALCITE-ACTION") {
    return;
  }
  if (activeWidget) {
    document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
    document.querySelector(`[data-block-id=${activeWidget}]`).hidden = true;
  }
  const nextWidget = target.dataset.actionId;
  if (nextWidget !== activeWidget) {
    document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
    document.querySelector(`[data-block-id=${nextWidget}]`).hidden = false;
    activeWidget = nextWidget;
  } else {
    activeWidget = null;
  }
};
document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);


// creating a map for the DOM container
async function createMap() {
  fieldsList.innerHTML = ""; // removing any preexising HTML from the fields list
  fieldsList.selectionMode = "single";

  try {
    const map = new WebMap({
      portalItem: { id: "a9ea93c330f9445cb7993653ee141333" }
    });
    await map.load(); // awaiting its load
    mapEl.map = map; // assigning it to the DOM element

    const firstExpression = appState.layerDefinitionExpressions[0]?.expression;
    const mismatched = appState.layerDefinitionExpressions.filter(
      l => l.expression !== firstExpression
    );
  
    await populateLayerList();

    if (mismatched.length > 0) {
      const details = appState.layerDefinitionExpressions
        .map(l => `${l.title}: '${l.expression}'`)
        .join("; ");
      warnUser(`Different definition expressions exist between layers: ${details}`);
    }

    for (let i=0;i < appState.featureLayers.length; i++){
      console.log(`Layer ${i}:`, appState.featureLayers[i]);
    }

  } catch (e) {
    warnUser(`Could not create/load layer from item ID 3cc124d922f3490fa2a23157d4ffd62e with error: ${e}`);
  }
}
await createMap();

async function populateLayerList(){
  layerList.innerHTML = ""; // removing any preexising HTML from the layer list
  appState.layerDefinitionExpressions = []; // clearing pre-existing defintino expressions

  // looping through the layers of the map
  // Collect definition expressions and layer titles
  for (const layer of mapEl.map.layers.items.toReversed()) { // we have to loop through the array backwards to get the layerList proper
    if (layer.type === "feature") { // only if its a feature layer
      await layer.load();
      appState.featureLayers.push(layer);
      appState.layerDefinitionExpressions.push({
        title: layer.title,
        expression: layer.definitionExpression || ""
      });


      // list item to represent the layer
      const listItem = document.createElement("calcite-list-item");
      listItem.label = layer.title;
      listItem.scale = "l";
      listItem.value = layer.title;
      listItem.selected = true; // selected by default to indicate a layer is visible

      // event listener for a layer's visibility toggle
      listItem.addEventListener("calciteListItemSelect", () => { // this event fires AFTER the property changes
        if(listItem.selected === true) { // if a layer was not selected when clicked, it is now selected (aka visible)
          console.log('layer turned on')
          console.log('map el layers', mapEl.map.layers);
          layer.visible = true; // should just be able to refer to layer here, as we're within a for loop of mapEl.map.layers     
        } else{ // otherwise it was selected before it was clicked, it is now unselected (aka hidden)
          console.log('layer turned off') 
          layer.visible = false;
        }
      });
      // and appending it to our calcite-list
      layerList.append(listItem);
    }
  }

  // initializing the top (blue) and bottom (red) renderers
  appState.blueRenderer = appState.featureLayers.at(0).renderer // map's top renderer should be blue
  console.log(`For layer ${appState.featureLayers.at(0).title} the top renderer is`, appState.blueRenderer); // log for debug
  
  appState.redRenderer = appState.featureLayers.at(-1).renderer // map's bottom renderer should be red
  console.log(`${appState.featureLayers.at(-1).title} the bottom renderer is`, appState.redRenderer); // log for debug

  // event listeners for our pseudo layer list
  layerList.addEventListener("calciteListOrderChange", () => {
    mapEl.map.layers.reverse(); // we need to actually reverse the layer of the oders within the map itself
    // then we need to reassign renderers 
    mapEl.map.layers.at(-1).renderer = appState.blueRenderer // assigning bottom renderer to new layer at final index, aka new bottom layer
    mapEl.map.layers.at(0).renderer = appState.redRenderer // assigning top renderer to new layer at the 0 index, aka top
  });
} 


// populating the fields list based on the first layer
function populateFieldsList(){
  appState.featureLayers[0].fields.forEach(field => { // we'll just use the first layer by default
    if (!ignoreFields.includes(field.name)) {
      createListItemForField(field);
    }
  });
}

function createListItemForField(f){
  // creating a calcite list item for the field        
  const listItem = document.createElement("calcite-list-item");
  listItem.label = f.alias;
  listItem.scale = "s";
  listItem.value = f.name;
  listItem.closable = true;
  
  // changing the selected field
  listItem.addEventListener("calciteListItemSelect", () => {
    if (listItem.selected){
      appState.filterField = f;
      console.log(`Selected field is now ${appState.filterField.alias}`);
      changeFilterField(); 
    }
  });
  
  // removing a field for the list
  listItem.addEventListener("calciteListItemClose", () => {
    console.log(`Remove clicked for field ${listItem.value}, definition expression is: ${appState.defintionExpression}`);
    if (listItem.value === appState.activeDefinitionExpression) {
      warnUser("Please select a different filter field before removing the selected field.");
      return;
    } else {
      warnUser("Removing field: ", f.alias);
      listItem.remove();
    }
  });

  // we'll select list item which matches the definition expression
  if (appState.activeDefinitionExpressionField === f.name){
    listItem.selected = true
  }

  // finally adding the item to the DOM list
  fieldsList.appendChild(listItem);
}

async function changeFilterField() {
  if (!appState.filterField) {
    warnUser("No filter field selected.");
    return;
  }

  mapEl.map.layers.forEach(layer => {
    if (layer.type === "feature") { // only applying this to the feature layers
      console.log(`\n--------- FILTER CHANGE -------------`);
      console.log(`Changing filter field for ${layer.title} to ${appState.filterField.alias}`);
      layer.definitionExpression = `${appState.filterField.name} > 0`;
      console.log(`New definition expression: ${layer.definitionExpression}`);
      console.log(`-------------------------------------\n`);
    }
  });
}

populateFieldsList();

/* 
HELPER FUNCTIONS
*/
// FUNCTION FOR DIPLAYING A CALCITE WARNING MESSAGE
function warnUser(message){
  // clear any existing warnings
  const existingAlert = document.querySelector("calcite-alert")
  if(existingAlert) existingAlert.remove(); // clearing any preexisting alerts

  // displaying an alert, warning the user to turn on the overlay when taking screensbot 
  const newAlert = document.createElement("calcite-alert");
  newAlert.open = true;
  newAlert.kind = "warning";
  newAlert.autoDismiss = true;
  const title = document.createElement("calcite-alert-message");
  title.textContent = message;
  title.slot = "title";
  newAlert.appendChild(title);

  // appending the warning to the DOM
  document.body.appendChild(newAlert);
}