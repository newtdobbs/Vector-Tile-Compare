import { setMapLOD } from "../state/actions";
import { applyFiltersToMap, createDefaultMap, queryItemsFromGroup } from "../map"
import { LODSlider, populateFieldsList, populateLayerList, tileStyleToggle } from "../ui";
import { appState } from "../state/store";
import { setSelectedTileStyle, setAGOLGroupID, clearStateForField } from "../state/actions"
import { warnUser } from "../helperFunctions";


export function wireEvents(){
    LODSlider.addEventListener("calciteSliderChange", () => {
        // console.log(`Slider changed to min(${LODSlider.minValue}), max(${LODSlider.maxValue})`)
        setMapLOD(LODSlider.minValue, LODSlider.maxValue);
        applyFiltersToMap();
    })
    // OBMButton.addEventListener("click", () => handleBasemapButtonSelect("OBM"));
    // EVTButton.addEventListener("click", () => handleBasemapButtonSelect("EVT"));
    tileStyleToggle.addEventListener("calciteSegmentedControlChange", handleBasemapButtonSelect)
}


async function handleBasemapButtonSelect(){
    // we only make these changes if the button clicked is NOT the current state value
    if (tileStyleToggle.value !== appState.selectedTileStyle) { 
        const loader = document.getElementById("app-loader");
        tileStyleToggle.disabled = true;
        loader.hidden = false;

        try {
            console.log('Setting selected tile style to:', tileStyleToggle.value)
            setSelectedTileStyle(tileStyleToggle.value);
            setAGOLGroupID();
            console.log('agol group ID is now', appState.groupID);
            clearStateForField();
            console.log('after clearing, state is now:', appState)
            const layerItems = await queryItemsFromGroup();
            console.log(`Queried the following items from ${appState.groupID}:`, layerItems)
            console.log('Creating a default map')
            await createDefaultMap(layerItems);
            console.log('Populating the fields list')
            console.log('Populating the fields list')
            await populateFieldsList();
            populateLayerList("top");
            populateLayerList("bottom");

            warnUser(`Set tile source to ${tileStyleToggle.selectedItem.textContent}`, "success");
        } catch (error) {
            console.error("Tile source switch failed", error);
            warnUser("Unable to switch tile sources. Please try again.");
        } finally {
            loader.hidden = true;
            tileStyleToggle.disabled = false;
        }
    } 
}