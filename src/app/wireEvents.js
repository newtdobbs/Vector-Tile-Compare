import { setMapLOD } from "../state/actions";
import { applyFiltersToMap } from "../map"
import { LODSlider, tileStyleToggle } from "../ui";
import { appState } from "../state/store";
import { setSelectedTileStyle, setAGOLGroupID } from "../state/actions"
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


function handleBasemapButtonSelect(){
    // we only make these changes if the button clicked is NOT the current state value
    if (tileStyleToggle.value !== appState.selectedTileStyle) { 
        const oldState = appState.selectedTileStyle
        setSelectedTileStyle(tileStyleToggle.value) 
        warnUser(`Setting basemap style to ${tileStyleToggle.selectedItem.textContent}`, "success")
        setAGOLGroupID();
    } 
}