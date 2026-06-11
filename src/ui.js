import { appState } from "../state";
import { APP_CONFIG } from "./config";
import { ignoreFields } from "./constants";
import { changeFilterField, changeMapLayers } from "./map";
import {
  clearFilterField,
  setFilterField,
  setSelectedLayerItemForTree,
} from "./stateActions";

const fieldsList = document.getElementById("fields-list");

/**
 * creates a calcite-list-item for a given field present in our feature layer
 * 
 * @param {object} field - the field object as represented from the ArcGIS JS API
 */
function createListItemForField(field) {
  const listItem = document.createElement("calcite-list-item");
  listItem.label = field.alias;
  listItem.scale = "s";
  listItem.value = field.name;
  listItem.closable = true;

  listItem.addEventListener("calciteListItemSelect", () => {
    if (listItem.selected) { // if the field is selected, we want to set it as the filter
      setFilterField(field);
    } else { // if the field is unselected, we want to clear the filter
      clearFilterField(); 
    }
    changeFilterField(); // after updating the filter field in state, we call this to update the map
  });

  listItem.addEventListener("calciteListItemClose", () => {
    // if the field that is removed is the current state filter, we warn the user and prevent its removal
    if (appState.filterField?.name && listItem.value === appState.filterField.name) { 
      warnUser("Please select a different filter field before removing the selected field.");
      return;
    } else {
        warnUser(`Removing field: ${field.alias}`);
        fieldsList.remove(listItem);
    }
  });

  // if the field matches the default ('Building'), we'll make sure the field entry is selected
  if (field.name === appState.defaultFilterField) {
    appState.filterField = field;
    listItem.selected = true;
    setFilterField(field);
  }


  fieldsList.appendChild(listItem);
}

/**
 * populates the calcite-list of the feature layer's fields with an entry for each field
 * 
 * @param {object} field - the field object as represented from the ArcGIS JS API
 */
export async function populateFieldsList() {
  fieldsList.innerHTML = "";

  const firstLayer = appState.map?.layers?.items?.[0]; // we'll just use the first layer in the map to determine the fields available
  if (!firstLayer) {
    warnUser("Unable to populate fields: map layer is not available.");
    return;
  }

  // when the first layer is ready, we loop through its fields and create a calcite list item for each field
  await firstLayer.when();
  firstLayer.fields.forEach((field) => {
    // assigning the default field in state also to the currently active field
    if(field.name === APP_CONFIG.filters.defaultField) {
      appState.filterField = field;
    }
    if (!ignoreFields.includes(field.name)) {
      createListItemForField(field);
    }
  });
}

/**
 * populates the calcite tree dropdowns with an item for each of the vector tile layers in state
 * 
 * @param {string} key - the name ('top' or 'bottom') of the tree to populate, which will determine the layer to select
 */
export function populateLayerList(key) {
  const tree = document.getElementById(`${key}-tree`);
  if (!tree) {
    return;
  }

  tree.innerHTML = ""; // clearing the HTML from the tree

  // looping through all the tile layers in state
  for (const layer of appState.allTileLayers) {
    const treeItem = document.createElement("calcite-tree-item");
    treeItem.label = layer.item.title;
    treeItem.textContent = layer.item.title;
    treeItem.expanded = true;

    // selecting the tree item that corresponds to the map layer (top layer for top tree, bottom layer for bottom tree)
    const isActiveLayer = layer.item.title === appState[`${key}Layer`].title;
    if (isActiveLayer) {
      treeItem.selected = true;
      setSelectedLayerItemForTree(key, layer.item);
    }

    tree.appendChild(treeItem);

    treeItem.addEventListener("click", async () => {
      if (layer.item.title === appState[`${key}Layer`].title) {
        appState[`${key}Layer`].visible = treeItem.selected; // setting the layer's visibility to match its selection
        return;
      }

      treeItem.disabled = true;
      const applied = await changeMapLayers(`${key}Layer`, layer.item);
      treeItem.disabled = false;

      if (applied) {
        setSelectedLayerItemForTree(key, layer.item);
        populateLayerList(key);
      }
    });
  }
}

/**
 * a helper functiuon to warn the user 
 * 
 * @param {string} message - the string to display in the calcite alert
 * @param {kind} message - the type (color) of the calcite alert
 */
export function warnUser(message, kind="warning") {
  const existingAlert = document.querySelector("calcite-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  const newAlert = document.createElement("calcite-alert");
  newAlert.open = true;
  newAlert.kind = kind;
  newAlert.autoClose = true;

  const title = document.createElement("calcite-alert-message");
  title.textContent = message;
  title.slot = "title";
  newAlert.appendChild(title);

  document.body.appendChild(newAlert);
}
