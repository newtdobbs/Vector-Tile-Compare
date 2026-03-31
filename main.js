import "@arcgis/map-components/components/arcgis-layer-list";
const Map = await $arcgis.import("@arcgis/core/Map.js");
const MapView = await $arcgis.import("@arcgis/core/views/MapView.js");
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");
const WebMap = await $arcgis.import("@arcgis/core/WebMap.js");
import "./style.css";

const mapEl = document.getElementById("mapEl");

const appState = {
  webMap: null,
  filterField: null,
  filterFieldName: null
}

mapEl.addEventListener("arcgisViewReadyChange", () => {
  const { title, thumbnailUrl, snippet, modified, tags } = mapEl.map.portalItem;
  document.getElementById("app-heading").heading = "Vector Tile Compare";
  document.getElementById("card-heading").innerHTML = title;
  document.getElementById("card-thumbnail").src = thumbnailUrl;
  document.getElementById("card-description").innerHTML = `<p>${snippet}</p><p>Last modified on ${modified}.</p>`;
  tags.forEach(tag => {
    document.getElementById("card-tags").innerHTML += `<calcite-chip>${tag}</calcite-chip>`;
  });

  document.getElementById("app-heading").removeAttribute("hidden");

});

let activeWidget;
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

const fieldsList = document.getElementById("fields-list");

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

async function populateFieldsList(){
  
  fieldsList.innerHTML = ""; // removing any preexisting fields
  fieldsList.selectionMode = "single"; 
  try {
    appState.webMap = new WebMap({
      portalItem: {id: "3cc124d922f3490fa2a23157d4ffd62e"}
    })
  } catch (e) {
    console.error(`Could not create/load layer from item ID 3cc124d922f3490fa2a23157d4ffd62e with error: ${e}`);
  }
  await appState.webMap.load();
  mapEl.map = appState.webMap;
  
  // DETERMINING THE DEFAULT FILTER
  const wmFeatureLayers = []
  appState.webMap.layers.forEach(layer => {
    if (layer.type === "feature") {
      wmFeatureLayers.push(layer); // adding the feature layer to an array we can use
      console.log(`Layer: ${layer.title}`);

      if (layer.definitionExpression) {
        console.log(`Filter expression: ${layer.definitionExpression}`);

        // Simple regex to get the first field name before an operator
        const match = layer.definitionExpression.match(/^\s*([^\s=<>!]+)/);
        if (match) {
          appState.filterFieldName = match[1].trim();
          console.log(`Filtered field: ${appState.filterFieldName}`);
        }
      } else {
        console.log("No filter applied.");
      }
    }
  });
  console.log("web map feature layers", wmFeatureLayers)

  // AFTER collecting all the feature layers for the web map
  if (wmFeatureLayers.length > 0) {
    const layer = wmFeatureLayers[0];
    await layer.load(); // we'll await its load to make sure the fields are available
    
    // Can log all the fields here for debug
    // console.log("All fields:");
    // wmFeatureLayers[0].fields.forEach(field => {
    //       console.log(`Field: ${field.name}, type: ${field.type}, valueType: ${field.valueType}`);
    //   });

    // looping through both the layers
    layer.fields.forEach(field => {
      // if its not one of the fields we want to ignore
      if (!ignoreFields.includes(field.name)) {

        
        const listItem = document.createElement("calcite-list-item");
        listItem.label = field.alias;
        listItem.scale = "s";
        listItem.value = field.name;
        listItem.closable = true;

        // if the field's alias matches the currently applied filter, we'll make it as the selected field
        if(field.name === appState.filterFieldName){
          appState.filterField = field; // then assinging the field object to the variable 
          listItem.selected = true;
          console.log(`Default filter determined as: ${appState.filterField.alias}`)
        }

        fieldsList.appendChild(listItem);

        listItem.addEventListener("calciteListItemSelect", () => {
          if (listItem.selected){
            appState.filterField = field;
            console.log(`Selected field ${appState.filterField.alias}`);
            changeFilterField(); // changing the filter field, pulling from state
          }
        });

        listItem.addEventListener("calciteListItemClose", () => {
          if (appState.filterField.alias === field.alias) {
            warnUser("Please select a different filter field before removing the selected field.");
          } else {
            warnUser("Removing field: ", field.alias);
          }
          listItem.remove();
        });
      }
    });
  }
};
await populateFieldsList();

async function changeFilterField() {
  if (!appState.filterField) {
    warnUser("No filter field selected.");
    return;
  }

  mapEl.map.layers.forEach(layer => {
    if (layer.type === "feature") {
      console.log(`Changing filter field for ${layer.title} to ${appState.filterField.alias}`);
      layer.definitionExpression = `${appState.filterField.name} > 0`;
      console.log(`New definition expression: ${layer.definitionExpression}`);
    }
  });
}

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




