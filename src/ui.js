import { appState } from "../state";
import { ignoreFields } from "./constants";
// import { changeFilterField } from "./map"


// dom elements
const fieldsList = document.getElementById("fields-list");
const layerList = document.getElementById("layer-list");
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
      const actionEl = document.querySelector(`[data-action-id=${appState.activeWidget}]`);
      if (actionEl) {
        actionEl.active = false;
        actionEl.setFocus();
      }
      appState.activeWidget = null;
    });
  });
}


// populating the fields list based on the first layer
export function populateFieldsList(){
  fieldsList.innerHTML = ""; // removing any preexising HTML from the fields list
  fieldsList.selectionMode = "single";
  const firstLayer = appState.map.layers.items[0]
  firstLayer.when(() => {
    firstLayer.fields.forEach(field => { // we'll just use the first layer by default
      if (!ignoreFields.includes(field.name)) {
        createListItemForField(field);
      }
    });
  });
};


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


// export async function populateLayerList(){
//   layerList.innerHTML = ""; // removing any preexising HTML from the layer list
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


//       // list item to represent the layer
//       const listItem = document.createElement("calcite-list-item");
//       listItem.label = layer.title;
//       listItem.scale = "l";
//       listItem.value = layer.title;
//       listItem.selected = true; // selected by default to indicate a layer is visible

//       // event listener for a layer's visibility toggle
//       listItem.addEventListener("calciteListItemSelect", () => { // this event fires AFTER the property changes
//         if(listItem.selected === true) { // if a layer was not selected when clicked, it is now selected (aka visible)
//           console.log('layer turned on')
//           console.log('map el layers', mapEl.map.layers);
//           layer.visible = true; // should just be able to refer to layer here, as we're within a for loop of mapEl.map.layers     
//         } else{ // otherwise it was selected before it was clicked, it is now unselected (aka hidden)
//           console.log('layer turned off') 
//           layer.visible = false;
//         }
//       });
//       // and appending it to our calcite-list
//       layerList.append(listItem);
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