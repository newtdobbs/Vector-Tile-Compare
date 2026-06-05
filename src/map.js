const BasemapGallery = await $arcgis.import("@arcgis/core/widgets/BasemapGallery.js");
const Search = await $arcgis.import("@arcgis/core/widgets/Search.js");
const Zoom = await $arcgis.import("@arcgis/core/widgets/Zoom.js");
const UI = await $arcgis.import("@arcgis/core/views/ui/UI.js");
import "@arcgis/map-components/components/arcgis-basemap-toggle";

import { appState } from "../state";
import "../style.css";
import { warnUser } from "./ui";
import { APP_CONFIG, getDefinitionExpression } from "./config";
import {
    isLayerSwapVersionCurrent,
    nextLayerSwapVersion,
    setActiveLayer,
    setMapContext,
    setTileLayers
} from "./stateActions";

const [Map, MapView] = await $arcgis.import(["@arcgis/core/Map.js", "@arcgis/core/views/MapView.js"]);
const PictureMarkerSymbol = await $arcgis.import("@arcgis/core/symbols/PictureMarkerSymbol.js");
    const [Portal, OAuthInfo, esriId, PortalQueryParams] = await $arcgis.import([
    "@arcgis/core/portal/Portal.js",
    "@arcgis/core/identity/OAuthInfo.js",
    "@arcgis/core/identity/IdentityManager.js",
        "@arcgis/core/portal/PortalQueryParams.js"
]);
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const FeatureEffect = await $arcgis.import("@arcgis/core/layers/support/FeatureEffect.js");
const FeatureFilter = await $arcgis.import("@arcgis/core/layers/support/FeatureFilter.js");
const mapEl = document.getElementById("mapEl");

// signing into the portal
let info = new OAuthInfo({
    appId: APP_CONFIG.oauth.appId,
    portalUrl: APP_CONFIG.oauth.portalUrl,
    flowType: APP_CONFIG.oauth.flowType,
    popup: APP_CONFIG.oauth.popup,
});

esriId.registerOAuthInfos([info]);

esriId
.checkSignInStatus(info.portalUrl + "/sharing")
.catch(() => {
    console.log("Not logged in");
});

document.getElementById("sign-in-button").addEventListener("click", () => {
    esriId.getCredential(info.portalUrl + "/sharing");
});

/**
 * pulls all the Esri Vector Basemap Tile Statistics feature layers from the AGOL group
 * 
 * @returns {array} an array of the tile layer items queried from the AGOL group
 */
export async function queryItemsFromGroup(){
    const params = new PortalQueryParams({
        query: `group:${APP_CONFIG.groupQuery.groupId}`, // grabbing the items from Jim's group
        num: APP_CONFIG.groupQuery.maxItems // setting a max of 20 items
    });
    
    const portal = new Portal();
    portal.authMode = "immediate";
    await portal.load();

   const results = await portal.queryItems(params);
    const allTileStats = results.results.filter(
        // filtering to only layers that contain "Esri Vector Basemap Tile Statistics"
        (item) => item.isLayer && item.title.includes(APP_CONFIG.groupQuery.requiredTitleText)
    );

    // console.log('All tile stats', allTileStats) // log for debug

   return allTileStats;
};

/**
 * Creates the default map upon app load
 * 
 * @param {array} layerItems - the tile layer items queried from the AGOL group
 * @returns {object} the map the user will see upon app load
 */
export async function createDefaultMap(layerItems) {
    if (layerItems.length < 2) {
        throw new Error("At least two tile layers are required to initialize the compare map.");
    }

    let basemapTileStatistics = layerItems.map(item => {
        const identifier = item.title.slice(-7) // this grabs the year and release suffix (e.g., '2026R04')
        const year = parseInt(identifier.split("R")[0]);
        const release = parseInt(identifier.split("R")[1]);
        return {item, year, release}
    })

    // this orders the basemap tile statistics chronologically by their suffix
    basemapTileStatistics.sort((a, b) => {
        if(b.year === a.year) {
            return b.release - a.release // for tiles within the same year, we sort by release
        }
        return b.year - a.year// otherwise we sort by year
    })

    // console.log('Sorted Esri Basemap Tile Statistics: ', basemapTileStatistics) // log for debug

    setTileLayers(basemapTileStatistics); // storing all basemap tile statistic layers in state

    const [newerItem, olderItem] = basemapTileStatistics.slice(0,2); // grabbing the two most recent tile statistics
    setActiveLayer("bottomLayer", new FeatureLayer({ portalItem: { id: newerItem.item.id } })); // assigning the bottom layer to the newer one
    // console.log('APP STATE BOTTOM LAYER', appState.bottomLayer) // log for debug
   
    setActiveLayer("topLayer", new FeatureLayer({ portalItem: { id: olderItem.item.id } })); // and assigning the top layer to the older one 
    // console.log('APP STATE TOP LAYER', appState.topLayer) // log for debug
    
    const myMap = new Map({ basemap: APP_CONFIG.map.basemap }); // creating an empty map with dark-gray-vector base
    
    const symbolSize = APP_CONFIG.map.symbolSize;
    
    // assigning the renderer for the map's bottom layer once the map loads
    appState.bottomLayer.when(() => {
        appState.bottomLayer.renderer = {
            type: "simple",
            symbol: new PictureMarkerSymbol({
                angle: 0,
                height: symbolSize,
                url: "data:image/png;base64,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",
                width: symbolSize,
                xoffset: 0,
                yoffset: 0
            })
        };
    });

    // assigning the renderer for the map's top layer once the map loads
    appState.topLayer.when(() => {
        appState.topLayer.renderer = {
            type: "simple",
            symbol: new PictureMarkerSymbol({
                angle: 0,
                height: symbolSize,
                url: "data:image/png;base64,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",
                width: symbolSize,
                xoffset: 0,
                yoffset: 0
            })
        };
    });
    
    // assigning the definition expression and 
    for (const l of [appState.topLayer, appState.bottomLayer]) {

        l.definitionExpression = getDefinitionExpression(APP_CONFIG.filters.defaultField); // assigning the default filter field
        
        const featureFilter = new FeatureFilter({
            where: `SIZE > ${APP_CONFIG.filters.featureEffectThreshold}` // assigning the default feature effect threshold
        });
        
        // waiting for the layer to be ready first before applying feature filter
        l.when(() => {
            l.featureEffect = new FeatureEffect({
                filter: featureFilter,
                includedEffect: "bloom(1.3 0.6pt 0)",
                excludedEffect: "opacity(0.35)"
            });
        }); 
    }
    
    // adding layers to map after applying effects (just to be safe with the order)
    myMap.add(appState.bottomLayer)
    myMap.add(appState.topLayer)


    mapEl.map = myMap // assigning the map we've created to the dom element


    // zooming to our map's default location & zoom level
    mapEl.addEventListener("arcgisViewReadyChange", () => {
        // console.log('map is ready') // log for debug
        mapEl.view.goTo(APP_CONFIG.map.initialCenter)
        mapEl.zoom = APP_CONFIG.map.initialZoom  
    })

    setMapContext(myMap);
    return myMap;
}

/**
 * Changes the field being used to filter visible features, either by switching the field, or removing the filter entirely
 */
export function changeFilterField(){
    const view = appState.view; // pulls the view from state
    if (!view) {
        warnUser("View is not ready yet. Please try again in a moment.");
        return;
    }

    // once the view is fully loaded
    view.when(function() {

        console.log('loaded view', view)

        const map = view.map; // we pull the map from the view
        
        // if there IS a filter applied
        if (appState.filterField) {
            warnUser(`Changing filter field to: "${appState.filterField.name}"`);
            map.layers.forEach((layer) => { // looping through the map's layers
                // console.log(`Changing filter field for ${layer.title} to ${appState.filterField.alias}`); // log for debug
                // console.log(`New definition expression: ${layer.definitionExpression}`); // log for debug
                // console.log(`For ${layer.title} the featureEffect is:`, layer.featureEffect); // log for  debug
                layer.definitionExpression = getDefinitionExpression(appState.filterField.name); // applying the newly selected field as a definition expression
            });


        // otherwise the filter has been REMOVED
        } else {
            warnUser("Removing filter field");
            map.layers.forEach((layer) => {
                // console.log(`New definition expression: ${layer.definitionExpression}`); // log for debug
                // console.log(`For ${layer.title} the featureEffect is:`, layer.featureEffect); // log for debug
                layer.definitionExpression = null; // removing the definition expression
            });
        }
    }, function(error){
        warnUser("An error occured while changing the map filter.")
    })
}

/**
 * Calculates the total cost of items including tax.
 * 
 * @param {string} layerKey - to name ('top' or 'bottom') of the layer from that will be changed
 * @param {object} portalItem - the portal item which will be converted into a FeatureLayer, and inserted into the map 
 */
export async function changeMapLayers(layerKey, portalItem){
    try {
        const requestVersion = nextLayerSwapVersion(layerKey); // this initalizes a new request for swapping a given layer
        const currentLayer = appState[layerKey]; // this pulls the layer we want to swap as it currently is in state
        // console.log('Before change, state layer was:', currentLayer); // log for debug
        const map = appState.map; // this pulls the map as it currently is in state
        const layerIndex = map.layers.indexOf(currentLayer); // the index of the layer we want to replace within the map

        // small catch if the map is not ready
        if (!currentLayer || !map || layerIndex < 0) {
            warnUser("Unable to swap layers because map state is not ready.");
            return false;
        }

        // creating a new feature layer for the portal item we passed in
        const replacementLayer = new FeatureLayer({
            portalItem: {id: portalItem.id}
        })
        await replacementLayer.load(); // awaiting the load of the replacement layer before moving on

        // after async loading, this ensures that swap we're about to do it still the LATEST from user click
        if (!isLayerSwapVersionCurrent(layerKey, requestVersion)) {  
            return false;
        }

        // pulling the renderer for the replacement layer from what is currently shown in the map 
        if (currentLayer.renderer){
            replacementLayer.renderer = currentLayer.renderer.clone?.() ?? currentLayer.renderer;
        }

        replacementLayer.definitionExpression = currentLayer.definitionExpression; // inheriting definition expression for the replacement
        if (currentLayer.featureEffect) { // also inheriting the feature effect
            replacementLayer.featureEffect =
            currentLayer.featureEffect.clone?.() ?? currentLayer.featureEffect;
        }
        replacementLayer.visible = currentLayer.visible; // and making the replacement layer visible

        map.remove(currentLayer); // removing the old layer
        map.add(replacementLayer, layerIndex); // adding the replacement layer at its relevant index
        if (!isLayerSwapVersionCurrent(layerKey, requestVersion)) {
            return false;
        }

        setActiveLayer(layerKey, replacementLayer); // inserting the replacement layer into state
        console.log('After change, state layer is:', appState[layerKey]);
        return true;

    } catch (error) {
        console.error("Layer swap failed", error);
        warnUser("Unable to swap map layer. Please try again.");
        return false;
    }
}

