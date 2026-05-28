import { appState } from "../state";
import { ignoreFields } from "./constants";
import { changeFilterField, changeMapLayers } from "./map"
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");

// dom elements
const shellPanel = document.getElementById("shell-panel");
const fieldsList = document.getElementById("fields-list");
const layerList = document.getElementById("layer-list");
export const topLayerList = document.getElementById("top-list");
export const bottomLayerList = document.getElementById("bottom-list");
const mapEl = document.getElementById("mapEl");
const actionBar = document.getElementById("action-bar");
const resetListsButton = document.getElementById("reset-list-button");

mapEl.map = appState.map;


// // event listener to open the corresponding panel 
function handleActionBarClick({ target }) {
  const panelToOpen = target.dataset.actionId
  console.log('panel clicked', panelToOpen)
  // looping through the panels 
  document.querySelectorAll('calcite-shell-panel[slot="panel-start"] calcite-panel').forEach(panelEl => {
    // opening the one that was clicked
    if (panelEl.dataset.panelId === panelToOpen) {
      panelEl.closed = false;
      panelEl.hidden = false;
      panelEl.active = true;
      appState.activeWidget = panelToOpen;
      // and closing the others
    } else {
      panelEl.closed = true;
      panelEl.hidden = true; 
      panelEl.active = false;
    }  
  });  
};
      
// event listener to close all panels for action bar collapse
function actionBarToggle (){
  // opening event
  if (actionBar.expanded){
    console.log('panel to open', appState.activeWidgte)
    shellPanel.collapsed = false;
    // opening the panel that was previously open
    document.querySelectorAll('calcite-shell-panel[slot="panel-start"] calcite-panel').forEach(panelEl => {
      if (panelEl.dataset.panelId === appState.activeWidget) {
        panelEl.closed = false;
        panelEl.hidden = false;
        panelEl.active = true;
      }
    });
  // closing event
  } else {
    console.log('closing panels')
    shellPanel.collapsed = true;

  }
};


export function setupPanel(){
  actionBar.addEventListener("calciteActionBarToggle", actionBarToggle) // open/close toggle
  actionBar.addEventListener("click", handleActionBarClick) // open/close toggle
  document.querySelectorAll('calcite-shell-panel[slot="panel-start"] calcite-panel').forEach(panelEl => {
    panelEl.addEventListener("calcitePanelClose", () => {
      console.log('closing panel', panelEl.id)
      panelEl.hidden=true;
      const actionEl = document.querySelector(`[data-action-id=${appState.activeWidget}]`);
      if (actionEl) {
        console.log('closing the active widget:', actionEl)
        actionEl.active = false;
        actionEl.setFocus();
        actionEl.hidden=true;
      }
      // appState.activeWidget = null;
      shellPanel.collapsed = true;
    });
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
    // SELECTION EVENT
    if (listItem.selected){
      console.log('field selected', f.name)
      appState.filterField = f; // assigning the selected field list item to state
    }
    // DESELECTION EVENT, REMOVE STATE FILTER
    else {
      console.log(f.name, 'removed as filter field')
      appState.filterField = null;
    }
    changeFilterField(); // changing the field filter, either swapping for selected field or removing filter entirely
  });
  
  // removing a field for the list
  listItem.addEventListener("calciteListItemClose", () => {
    console.log(`Remove clicked for field ${listItem.value}, definition expression is: ${appState.defintionExpression}`);
    if (listItem.value === appState.filterField.name) {
      warnUser("Please select a different filter field before removing the selected field.");
      return; // won't remove the field if it is the current state filter
    } else {
      warnUser("Removing field: ", f.alias);
      listItem.remove();
    }
  });

  if (f.name === appState.defaultFilterField){ //select list item which matches the definition expression
    listItem.selected = true
  }
  
  fieldsList.appendChild(listItem); // finally adding the item to the DOM list
}

// populating the fields list based on the first layer
export async function populateFieldsList(){
  fieldsList.innerHTML = ""; // removing any preexising HTML from the fields list
  const firstLayer = appState.map.layers.items[0]
  await firstLayer.when(() => {
    firstLayer.fields.forEach(field => { // we'll just use the first layer by default
      if (!ignoreFields.includes(field.name)) {
        createListItemForField(field);
      }
    });
  });
};


export function populateLayerList(key) {
  const tree = document.getElementById(`${key}-tree`);
  tree.innerHTML = ""; // clearing the list
  appState.currentSelectedLayers = [];

  console.log('All tile layers:', appState.allTileLayers)
  for (const layer of appState.allTileLayers) {
    //  list item to represent the layer
    const treeItem = document.createElement("calcite-tree-item");
    treeItem.label = layer.item.title;
    treeItem.textContent = layer.item.title
    
    // selecting the items corresponding to the top layer and bottom layer
    if (layer.item.title === appState[`${key}Layer`].title){
      treeItem.selected = true;
      appState.currentSelectedLayers.push(layer.item);
    }
    treeItem.expanded = true;
    tree.appendChild(treeItem);

    // selection event
      treeItem.addEventListener("click", ()=>{ 
        // RESELECTING STATE LAYER, JUST CHANGE VISIBILITY
        if (layer.item.title === appState[`${key}Layer`].title){
          // SELECTION EVENT
          if(treeItem.selected){ 
            console.log(`Making ${layer.item.title} visible`)
            appState[`${key}Layer`].visible = true;
            
            // DESELECTION EVENT, HIDE LAYER
          } else {
            console.log(`Hiding ${layer.item.title}`)
            appState[`${key}Layer`].visible = false;

          }
        // SELECTING A DIFFERENT LAYER, NEED TO CHANGE MAP STATE
        }else{ 
          console.log(`Different layer selected, ${layer.item.title} does not match ${appState[`${key}Layer`].title}`)
          changeMapLayers(`${key}Layer`, layer.item)
        }
      })
  }
}

export function warnUser(message){
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