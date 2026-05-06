// dom elements
const fieldsList = document.getElementById("fields-list");
const layerList = document.getElementById("layer-list");


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