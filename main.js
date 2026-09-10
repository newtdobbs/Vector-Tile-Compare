import "./style.css";
import { createDefaultMap, queryItemsFromGroup } from "./src/map";
import { populateFieldsList, populateLayerList } from "./src/ui";
import { setDefaultFilterField } from "./src/state/actions";
import { appState } from "./src/state/store";
import { warnUser } from "./src/helperFunctions";
import { wireEvents } from "./src/app/wireEvents";

async function bootstrapApp() {
  try {
    setDefaultFilterField(appState.defaultFilterField);

    const layerItems = await queryItemsFromGroup();
    await createDefaultMap(layerItems);

    document.getElementById("app-loader").hidden = true;

    await populateFieldsList();
    populateLayerList("top");
    populateLayerList("bottom");
    wireEvents();
  } catch (error) {
    console.error("Application bootstrap failed", error);
    warnUser("Application failed to initialize. Check console for details.");
  }
}

await bootstrapApp();
