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
export function populateLayerList(key) {
  const tree = document.getElementById(`${key}-tree`);
  tree.innerHTML = ""; // clearing the list
  appState.currentSelectedLayers = [];
  let stateLayer = appState[`${key}Layer`]

  console.log('All tile layers:', appState.allTileLayers)
  for (const layer of appState.allTileLayers) {
    //  list item to represent the layer
    const treeItem = document.createElement("calcite-tree-item");
    treeItem.label = layer.item.title;
    treeItem.textContent = layer.item.title
    
    // selecting the items corresponding to the top layer and bottom layer
    if (layer.item.title === stateLayer.title){
      treeItem.selected = true;
      appState.currentSelectedLayers.push(layer.item);
    }
    treeItem.expanded = true;
    tree.appendChild(treeItem);

    treeItem.addEventListener("click", ()=>{ // this fires AFTER selection, reflecting the final state
      // console.log(`Is ${treeItem.label} selected: ${treeItem.selected}`);
      // selection event
      // if(treeItem.selected){ // for re-selecting the state layer        
      //   if (appState[`${key}Layer`].title === layer.title){
      //     console.log('same layer re-selected')
      //   } else { // selecting a different layer
      //     // console.log('layer change') 
      //     // changeMapLayers(`${key}Layer`, layer)
      //   }        
      // } else { // deselection event, we'll leave 
      //   appState[`${key}Layer`].visible = false; // clearing the state layer for deselection
      //   console.log('layer turned off')
      // }

      
      if(treeItem.selected){ // selection event

        // if the selected layer is the same as state layer, just turn it on
        // otherwise change the map's layers
        
        
      }else{ // deselection event

      }
        //just change visibilitt





      
      console.log(`${key} state layer:`, appState[`${key}Layer`].title)
    })
  }
  tree.expanded = true;
  // console.log('tree', /, tree)
}

resetListsButton.addEventListener("click", function() {
  populateLayerList(topLayerList, "top");
  populateLayerList(bottomLayerList, "bottom");
});
