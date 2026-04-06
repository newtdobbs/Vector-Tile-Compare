async function populateFieldsList(){
  
  fieldsList.innerHTML = ""; // removing any preexisting fields
  fieldsList.selectionMode = "single"; 
  try {
    const map = new WebMap({
      portalItem: {id: "3cc124d922f3490fa2a23157d4ffd62e"}
    })
    await map.load();
    mapEl.map = map; // assigning it to the DOM element
    // console.log("WEB Map from AGOL:", map);
  } catch (e) {
    warnUser(`Could not create/load layer from item ID 3cc124d922f3490fa2a23157d4ffd62e with error: ${e}`);
  }
  // await appState.webMap.load();
  // mapEl.map = appState.webMap;
  
  // DETERMINING THE DEFAULT FILTER
  // const wmFeatureLayers = []
  mapEl.map.layers.forEach(layer => {
    if (layer.type === "feature") {
      await layer.load(); 
      // wmFeatureLayers.push(layer); // adding the feature layer to an array we can use
      console.log(`Layer title: ${layer.title}`);
      console.log('Layer info', layer);
      console.log('Layer fields', layer.fields);

      if (layer.definitionExpression) {
        console.log(`Filter expression: ${layer.definitionExpression}`);

        // Simple regex to get the first field name before an operator
        const match = layer.definitionExpression.match(/^\s*([^\s=<>!]+)/)[1].trim();
        // console.log(`Looking for field match of name: ${match[1].trim()}`)

        // layer.fields.forEach(field => {
          // console.log(`Field: ${field.name}, type: ${field.type}, valueType: ${field.valueType}`);
        // });
        if (match) {
          console.log(layer.fields.find(f => f.name === match[1].trim()))
           user = users.find(u => u.name === "Bob");
          // appState.filterFieldName = appState.filter
          console.log('Filtered field:', appState.filterField);

        }
      } else {
        console.log("No filter applied.");
      }
    }
  });
  mapEl.map.layers.reverse();  // reversing the array here, as JS SDK stores a map's feature layers in the wrong order

  console.log("web map feature layers", wmFeatureLayers)

  // AFTER collecting all the feature layers for the web map
  if (wmFeatureLayers.length > 0) {
    const layer = wmFeatureLayers[0]; // we'll just use the first layer obtained to create a fields list
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

        // creating a calcite list item for the field        
        const listItem = document.createElement("calcite-list-item");
        listItem.label = field.alias;
        listItem.scale = "s";
        listItem.value = field.name;
        listItem.closable = true;

        // if the field's alias matches the currently applied filter, we'll make it as the selected field
        if(field.name === appState.filterFieldName){
          // appState.filterField = field; // then assinging the field object to the variable 
          listItem.selected = true;
          // console.log(`Default filter determined as: ${appState.filterField.alias}`)
        }
        fieldsList.appendChild(listItem);

        // changing the selected field
        listItem.addEventListener("calciteListItemSelect", () => {
          if (listItem.selected){
            appState.filterField = field;
            console.log(`Selected field ${appState.filterField.alias}`);
            changeFilterField(); // changing the filter field, pulling from state
          }
        });

        // removing a field for the list
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
      console.log(`--------- FILTER CHANGE -------------`);
      console.log(`Changing filter field for ${layer.title} to ${appState.filterField.alias}`);
      layer.definitionExpression = `${appState.filterField.name} > 0`;
      console.log(`New definition expression: ${layer.definitionExpression}`);
      console.log('For ${layer.title} the featureEffect is:', layer.featureEffect);
      console.log(`-------------------------------------`);
      
    }
  });
  
}

async function populateLayerList(){
  layerList.innerHTML = ""; // removing any preexising HTML from the layer list
  layerList.selectionMode = "single";  

  // looping through the layers of the map
  // Collect definition expressions and layer titles
  for (const layer of mapEl.map.layers) {
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
      
      // and appending it to our calcite-list
      layerList.append(listItem);
    }
  }
}
