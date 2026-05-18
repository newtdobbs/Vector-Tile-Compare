import { appState } from "../state";
import { ignoreFields } from "./constants";
// import { changeFilterField } from "./map"


// dom elements
const fieldsList = document.getElementById("fields-list");
const layerList = document.getElementById("layer-list");
export const topLayerList = document.getElementById("top-list");
export const bottomLayerList = document.getElementById("bottom-list");
const mapEl = document.getElementById("mapEl")
const actionBar = document.getElementById("action-bar")
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

function enforceSingleSelection(listName) {
  // const list = document.getElementById(listId);
    listName.addEventListener("calciteListItemSelect", (event) => {
      const selectedItems = list.querySelectorAll("calcite-list-item[selected]");
      if (selectedItems.length > 1) {
        selectedItems.forEach((item) => {
          if (item !== event.target) {
            item.selected = false;
          }
        });
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
  
// export function populateOuterList(){
//   layerList.addEventListener("calciteListChange", (event) => {
//     const outerItems = layerList.querySelectorAll('calcite-list-item[selection-mode="multiple"]')
//     console.log('OUTER ITEMS', outerItems);
//     const activeOuterItems = outerItems.filter(item => layerList.selectedItems.includes(item));
//     console.log('outer list selection', activeOuterItems);
//   })
// }

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

function populateOuterList(){

}

export function populateLayerList(list, layerToSelect){
  // console.log('PULLING TILE LAYERS FROM STATE', appState.allTileLayers)
  const outerListItme = document.getElementById(`list${-item}`)
  
  console.log('attaching visibilitt listener for list: ', list)
  
  list.addEventListener("calciteListChange",() => {
    console.log(`Visibility changed for ${list.id}`)}
  )
   
  // populating the list with list items for each tile layer 
  for (const layer of appState.allTileLayers) {
    //  list item to represent the layer
    const listItem = document.createElement("calcite-list-item");
    listItem.label = layer.item.title;
    listItem.scale = "l";
    listItem.value = layer.item.title;
    
    if (layer.item.title === layerToSelect.title) {
      listItem.selected = true; // selecting the layers which are present by default
    }
    // event listener for a layer's visibility toggle
    listItem.addEventListener("calciteListItemSelect", () => { // this event fires AFTER the property changes
      console.log(`Layer selected for ${list.id}: ${listItem.label}`)
    });
    // and appending it to our calcite-list
    list.append(listItem);
  }

  enforceSingleSelection(list);
  // adding an event listener for toggling the list's visibility
}


// export async function populateLayerList(){
//   appState.layerDefinitionExpressions = []; // clearing pre-existing defintino expressions

//   // looping through the layers of the map
//   // Collect definition expressions and layer titles
//   for (const layer of mapEl.map.layers.items) { // we have to loop through the array backwards to get the layerList proper
    
    
//     if (layer.type === "feature") { // only if its a feature layer
//       await layer.load();
//       appState.featureLayers.push(layer);
//       appState.layerDefinitionExpressions.push({
//         title: layer.title,
//         expression: layer.definitionExpression || ""
//       });


//  
//     }
//   }

  // // initializing the top (blue) and bottom (red) renderers
  // appState.blueRenderer = appState.featureLayers.at(0).renderer // map's top renderer should be blue
  // console.log(`For layer ${appState.featureLayers.at(0).title} the top renderer is`, appState.blueRenderer); // log for debug
  
  // appState.redRenderer = appState.featureLayers.at(-1).renderer // map's bottom renderer should be red
  // console.log(`${appState.featureLayers.at(-1).title} the bottom renderer is`, appState.redRenderer); // log for debug

  // // event listeners for our pseudo layer list
  // layerList.addEventListener("calciteListOrderChange", () => {
  //   mapEl.map.layers.reverse(); // we need to actually reverse the layer of the oders within the map itself
  //   // then we need to reassign renderers 
  //   mapEl.map.layers.at(-1).renderer = appState.blueRenderer // assigning bottom renderer to new layer at final index, aka new bottom layer
  //   mapEl.map.layers.at(0).renderer = appState.redRenderer // assigning top renderer to new layer at the 0 index, aka top
  // });
// } 