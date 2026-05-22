import { appState } from "../state";
import { ignoreFields } from "./constants";
import { changeFilterField, changeMapLayers } from "./map"


// dom elements
const fieldsList = document.getElementById("fields-list");
const layerList = document.getElementById("layer-list");
export const topLayerList = document.getElementById("top-list");
export const bottomLayerList = document.getElementById("bottom-list");
const mapEl = document.getElementById("mapEl")
const actionBar = document.getElementById("action-bar")
const resetListsButton = document.getElementById("reset-list-button")
mapEl.map = appState.map;

function handleActionBarClick({ target }) {
  console.log('target', target.dataset.actionId)
  const panelToOpen = target.dataset.actionId
  document.querySelectorAll('calcite-shell-panel[slot="panel-start"] calcite-panel').forEach(panelEl => {
    if (panelEl.dataset.panelId === panelToOpen) {

      panelEl.closed = false;
      panelEl.hidden = false;
    } else {
      panelEl.closed = true;
      panelEl.hidden = true; 
    }
  });
}
document.getElementById("action-bar").addEventListener("click", handleActionBarClick);

export function setupPanelCloseHandlers() {
  document.querySelectorAll('calcite-shell-panel[slot="panel-start"] calcite-panel').forEach(panelEl => {
    panelEl.addEventListener("calcitePanelClose", () => {
      panelEl.hidden=true;
      const actionEl = document.querySelector(`[data-action-id=${appState.activeWidget}]`);
      if (actionEl) {
        actionEl.active = false;
        actionEl.setFocus();
        actionEl.hidden=true;
      }
      appState.activeWidget = null;
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
    if (listItem.selected){
      appState.filterField = f;
      console.log(`Selected field is now ${appState.filterField.alias}`);
      // changeFilterField(); 
    }
  });
  
  // removing a field for the list
  listItem.addEventListener("calciteListItemClose", () => {
    console.log(`Remove clicked for field ${listItem.value}, definition expression is: ${appState.defintionExpression}`);
    if (listItem.selected) {
      warnUser("Please select a different filter field before removing the selected field.");
      return;
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
  fieldsList.selectionMode = "single";
  const firstLayer = appState.map.layers.items[0]
  await firstLayer.when(() => {
    firstLayer.fields.forEach(field => { // we'll just use the first layer by default
      if (!ignoreFields.includes(field.name)) {
        createListItemForField(field);
      }
    });
  });
};

// function enforceSingleSelection(listOfLayers){
  
// }
function rebuildStateLayers(){
  if(appState.currentSelectedLayers.length > 0){
    appState.bottomLayer
  }

  console.log('REBUILD:')
  console.log('app state top layer', appState.topLayer);
  console.log('app state bottom layer', appState.bottomLayer);
}
export function newPopulateLayerList(treeName) {
  const tree = document.getElementById(treeName);
  tree.innerHTML = ""; // clearing the list
  appState.currentSelectedLayers = [];
  const customLayerOrder = [];
  for (const layer of appState.allTileLayers) {
    //  list item to represent the layer
    const treeItem = document.createElement("calcite-tree-item");
    treeItem.label = layer.item.title;
    treeItem.textContent = layer.item.title
    // listItem.scale = "l";
    // listItem.value = layer.item.title;
    // listItem.closable = true;
    
    // selecting the items corresponding to the top layer and bottom layer
    if (layer.item.title === appState.topLayer.title || layer.item.title === appState.bottomLayer.title){
      treeItem.selected = true;
      appState.currentSelectedLayers.push(layer.item);
    }
    tree.appendChild(treeItem);
  }
  console.log('tree', treeName, tree)
}

    // listItem.addEventListener("calciteListItemSelect", (event) => {

    //   // deselection event
    //   if(!listItem.selected){ 
    //     appState.currentSelectedLayers = appState.currentSelectedLayers.filter(l => l.title !== listItem.label); // removing the portal item from the state array
    //     console.log('removing from', listItem.label, 'from state selection:')
    //     if (layer.title === appState.topLayer.title){
    //       appState.topLayer.visible = false;
    //     } else if (layer.title === appState.bottomLayer.title){
    //       appState.bottomLayer.visible = false;
    //     }

    //   // selection event
    //   } else{ 
    //     // if there were already 2 items selected
    //     if(appState.currentSelectedLayers.length >= appState.maxLayerListSelectedItems){ 
    //       event.stopPropagation(); 
    //       listItem.selected = false; // we ignore the selection event
    //     // otherwise if there was only 1 item selected
    //     } else { 
    //       listItem.selected = true; // we select the item 
    //       appState.currentSelectedLayers.push(layer.item); // and add it to the state array
    //       if (layer.title === appState.topLayer.title){
    //         appState.topLayer.visible = false;
    //       } else if (layer.title === appState.bottomLayer.title){
    //         appState.bottomLayer.visible = false;
    //       }
    //     }
    //   }
    //   console.log('state selection', appState.currentSelectedLayers )
    // })

export function populateLayerList(){
  layerList.innerHTML = "";
  appState.currentSelectedLayers = [];
  const customLayerOrder = [];
  for (const layer of appState.allTileLayers) {
    //  list item to represent the layer
    const listItem = document.createElement("calcite-list-item");
    listItem.label = layer.item.title;
    listItem.scale = "l";
    listItem.value = layer.item.title;
    listItem.closable = true;
    
    // selecting the items corresponding to the top layer and bottom layer
    if (layer.item.title === appState.topLayer.title || layer.item.title === appState.bottomLayer.title){
      listItem.selected = true;
      appState.currentSelectedLayers.push(layer.item);
    }

    listItem.addEventListener("calciteListItemSelect", (event) => {

      // deselection event
      if(!listItem.selected){ 
        appState.currentSelectedLayers = appState.currentSelectedLayers.filter(l => l.title !== listItem.label); // removing the portal item from the state array
        console.log('removing from', listItem.label, 'from state selection:')
        if (layer.title === appState.topLayer.title){
          appState.topLayer.visible = false;
        } else if (layer.title === appState.bottomLayer.title){
          appState.bottomLayer.visible = false;
        }

      // selection event
      } else{ 
        // if there were already 2 items selected
        if(appState.currentSelectedLayers.length >= appState.maxLayerListSelectedItems){ 
          event.stopPropagation(); 
          listItem.selected = false; // we ignore the selection event
        // otherwise if there was only 1 item selected
        } else { 
          listItem.selected = true; // we select the item 
          appState.currentSelectedLayers.push(layer.item); // and add it to the state array
          if (layer.title === appState.topLayer.title){
            appState.topLayer.visible = false;
          } else if (layer.title === appState.bottomLayer.title){
            appState.bottomLayer.visible = false;
          }
        }
      }
      console.log('state selection', appState.currentSelectedLayers )
    })
    customLayerOrder.push(listItem); // adding it to a dummy array
  }
  // swapping the top two layers
  [customLayerOrder[0], customLayerOrder[1]] = [customLayerOrder[1], customLayerOrder[0]];
  customLayerOrder.forEach((l) => {layerList.append(l)}); // building our calcite list using the custom layer order with top swapped
}



resetListsButton.addEventListener("click", function() {
  populateLayerList(topLayerList, "topLayer");
  populateLayerList(bottomLayerList, "bottomLayer");
});
