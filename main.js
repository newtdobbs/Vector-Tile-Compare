import "./style.css";
import { APP_CONFIG } from "./src/config";
import { createDefaultMap, queryItemsFromGroup } from "./src/map";
import { populateFieldsList, populateLayerList, warnUser } from "./src/ui";
import { setDefaultFilterField } from "./src/stateActions";

async function bootstrapApp() {
  try {
    setDefaultFilterField(APP_CONFIG.filters.defaultField);

    const layerItems = await queryItemsFromGroup();
    await createDefaultMap(layerItems);

    document.getElementById("app-loader").hidden = true;

    await populateFieldsList();
    populateLayerList("top");
    populateLayerList("bottom");
  } catch (error) {
    console.error("Application bootstrap failed", error);
    warnUser("Application failed to initialize. Check console for details.");
  }
}

await bootstrapApp();
