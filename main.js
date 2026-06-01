import "@arcgis/map-components/components/arcgis-layer-list";
const PortalItem = await $arcgis.import("@arcgis/core/portal/PortalItem.js");
import "./style.css";
import ElevationSampler from "@arcgis/core/layers/support/ElevationSampler";
import { appState } from "./state";
import { queryItemsFromGroup, createDefaultMap } from "./src/map";
import { populateFieldsList, populateLayerList, setupPanel } from "./src/ui";



const shellPanel = document.getElementById("shell-panel");
setupPanel();

const actions = shellPanel?.querySelectorAll("calcite-action");

const layerItems = await queryItemsFromGroup();
await createDefaultMap(layerItems).then(() => {
  document.getElementById("app-loader").hidden = true;
});



await populateFieldsList();

populateLayerList("top")
populateLayerList("bottom")


// let activeWidget;
// const handleActionBarClick = ({ target }) => {
//   if (target.tagName !== "CALCITE-ACTION") {
//     return;
//   }
//   if (activeWidget) {
//     document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
//     document.querySelector(`[data-block-id=${activeWidget}]`).hidden = true;
//   }
//   const nextWidget = target.dataset.actionId;
//   if (nextWidget !== activeWidget) {
//     document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
//     document.querySelector(`[data-block-id=${nextWidget}]`).hidden = false;
//     activeWidget = nextWidget;
//   } else {
//     activeWidget = null;
//   }
// };
// document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);


// // creating a map for the DOM container
// async function createMap() {
//   fieldsList.innerHTML = ""; // removing any preexising HTML from the fields list
//   fieldsList.selectionMode = "single";

//   const groupLayers = []
//   try {
//     // const map = new WebMap({
//     //   portalItem: { id: "a9ea93c330f9445cb7993653ee141333" }
//     // }); // old code to load a map from the preexisting WM id
//     const map = new Map({
//       basemap: 'gray-vector',
//       layers: groupLayers
//     })
//     await map.load(); // awaiting its load
//     mapEl.map = map; // assigning it to the DOM element
    
//     await populateLayerList();
    
//     for (let i=0;i < appState.featureLayers.length; i++){
//       console.log(`Layer ${i}:`, appState.featureLayers[i]);
//     }

//   } catch (e) {
//     warnUser(`Could not create/load layer from item ID 3cc124d922f3490fa2a23157d4ffd62e with error: ${e}`);
//   }
// }

// async function populateLayerList(){
//   layerList.innerHTML = ""; // removing any preexising HTML from the layer list
//   appState.layerDefinitionExpressions = []; // clearing pre-existing defintino expressions

//   // looping through the layers of the map
//   // Collect definition expressions and layer titles
//   for (const layer of mapEl.map.layers.items.toReversed()) { // we have to loop through the array backwards to get the layerList proper
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

//   // initializing the top (blue) and bottom (red) renderers
//   appState.blueRenderer = appState.featureLayers.at(0).renderer // map's top renderer should be blue
//   console.log(`For layer ${appState.featureLayers.at(0).title} the top renderer is`, appState.blueRenderer); // log for debug
  
//   appState.redRenderer = appState.featureLayers.at(-1).renderer // map's bottom renderer should be red
//   console.log(`${appState.featureLayers.at(-1).title} the bottom renderer is`, appState.redRenderer); // log for debug

//   // event listeners for our pseudo layer list
//   layerList.addEventListener("calciteListOrderChange", () => {
//     mapEl.map.layers.reverse(); // we need to actually reverse the layer of the oders within the map itself
//     // then we need to reassign renderers 
//     mapEl.map.layers.at(-1).renderer = appState.blueRenderer // assigning bottom renderer to new layer at final index, aka new bottom layer
//     mapEl.map.layers.at(0).renderer = appState.redRenderer // assigning top renderer to new layer at the 0 index, aka top
//   });
// } 


// populating the fields list based on the first layer
// function populateFieldsList(){
  

//   const firstExpression = appState.layerDefinitionExpressions[0]?.expression;
//   const mismatched = appState.layerDefinitionExpressions.filter(
//     l => l.expression !== firstExpression
//   );
//   console.log("Layer definition expressions:", appState.layerDefinitionExpressions)

//   // if the layers have different definition expressions we'll warn the user
//   if (mismatched.length > 0) {
//     const details = appState.layerDefinitionExpressions
//       .map(l => `${l.title} definition expression: '${l.expression}'`)
//       .join("; ");
//     warnUser(`Please double check the web map, different definition expressions exist between layers: ${details}`);
  
//   // otherwise we'll select the lsit item which matches the defintiion expression field
//   } else {
//     appState.activeDefinitionExpressionField = firstExpression.split(' ')[0] // everything before the first space should be field name
//     console.log(`App state's active definition expression is: ${appState.activeDefinitionExpressionField}`)
//   }

//   appState.featureLayers[0].fields.forEach(field => { // we'll just use the first layer by default
//     if (!ignoreFields.includes(field.name)) {
//       createListItemForField(field);
//     }
//   });
// }

// function createListItemForField(f){
//   // creating a calcite list item for the field        
//   const listItem = document.createElement("calcite-list-item");
//   listItem.label = f.alias;
//   listItem.scale = "s";
//   listItem.value = f.name;
//   listItem.closable = true;


  
//   // changing the selected field
//   listItem.addEventListener("calciteListItemSelect", () => {
//     if (listItem.selected){
//       appState.filterField = f;
//       console.log(`Selected field is now ${appState.filterField.alias}`);
//       changeFilterField(); 
//     }
//   });
  
//   // removing a field for the list
//   listItem.addEventListener("calciteListItemClose", () => {
//     console.log(`Remove clicked for field ${listItem.value}, definition expression is: ${appState.defintionExpression}`);
//     if (listItem.value === appState.activeDefinitionExpression) {
//       warnUser("Please select a different filter field before removing the selected field.");
//       return;
//     } else {
//       warnUser("Removing field: ", f.alias);
//       listItem.remove();
//     }
//   });

//   // we'll select list item which matches the definition expression
//   if (appState.activeDefinitionExpressionField === f.name){
//     listItem.selected = true
//   }

//   // finally adding the item to the DOM list
//   fieldsList.appendChild(listItem);
// }

// async function changeFilterField() {
//   if (!appState.filterField) {
//     warnUser("No filter field selected.");
//     return;
//   }

//   mapEl.map.layers.forEach(layer => {
//     if (layer.type === "feature") { // only applying this to the feature layers
//       console.log(`\n--------- FILTER CHANGE -------------`);
//       console.log(`Changing filter field for ${layer.title} to ${appState.filterField.alias}`);
//       layer.definitionExpression = `${appState.filterField.name} > 0`;
//       console.log(`New definition expression: ${layer.definitionExpression}`);
//       console.log(`-------------------------------------\n`);
//     }
//   });
// }

// populateFieldsList();

