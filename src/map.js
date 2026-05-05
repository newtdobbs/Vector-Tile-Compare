import PortalItem from "@arcgis/core/portal/PortalItem";

const [Map, MapView] = await $arcgis.import(["@arcgis/core/Map.js", "@arcgis/core/views/MapView.js"]);
  const [Portal, OAuthInfo, esriId, PortalQueryParams] = await $arcgis.import([
    "@arcgis/core/portal/Portal.js",
    "@arcgis/core/identity/OAuthInfo.js",
    "@arcgis/core/identity/IdentityManager.js",
    "@arcgis/core/portal/PortalQueryParams.js",
]);
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");


let info = new OAuthInfo({
    appId: 'LZ49XhZatXR6WAJO', // this is the CLIENT id from the app item
    portalUrl: 'https://arcgis-content.maps.arcgis.com', 
    flowType: "auto",
    popup: false,
});

let groupFeatureLayers = [];

esriId.registerOAuthInfos([info]);

esriId
.checkSignInStatus(info.portalUrl + "/sharing")
.catch(() => {
    console.log("Not logged in");
});

document.getElementById("sign-in-button").addEventListener("click", () => {
    esriId.getCredential(info.portalUrl + "/sharing");
});

export async function queryItemsFromGroup(){
    const params = new PortalQueryParams({
        query: "group:7818b0837c064c158b4cbf777570390d", // jim's group
        // query: "group:be3766ac45fc4310a2e8cf12224e5618", // my test group
        num: 20
    });
    
    const portal = new Portal();
    portal.authMode = "immediate";
    await portal.load();

   const results = await portal.queryItems(params);
   return results.results.filter(item => item.isLayer && item.title.includes("Esri Vector Basemap Tile Statistics"));
};

function assignLayerRenderers(originalMapLayers){
    // originalMapLayers[0] is NEWER, so it should be bottom (red)
    // originalMapLayers[1] is OLDER, so it should be bottom (blue)


    we'll use .map() to return a NEW arrayu


    const customRenderedLayers = originalMapLayers.map(l => {
        // assign a definition expression (default to BUILDING > 0)
        // assign a feature effect (default: SIZE > 40000)
        // use an if-else to assign red vs blue symbology

    })
    // then change the symbology of the 

    return customRenderedLayers

}

export async function createDefaultMap(layerItems) {
    // console.log('layer items', layerItems)
    let basemapTileStatistics = layerItems.map(item => {
        const identifier = item.title.slice(-7) // this grabs the year and release suffix (e.g., '2026R04')
        const year = parseInt(identifier.split("R")[0]);
        const release = parseInt(identifier.split("R")[1]);
        return {item, year, release}
    })

    basemapTileStatistics.sort((a, b) => {
        if(b.year === a.year) {
            return b.release - a.release // for tiles within the same year, we sort by release
        }
        return b.year - a.year// otherwise we sort by year
    })

    // console.log('Sorted Esri Basemap Tile Statistics: ', basemapTileStatistics) // array of PortalItems, each with a url which i can convert to feature layers

    const mapLayers = basemapTileStatistics.slice(0, 2).map(b => {
        console.log('item url', b.item.url)
        const fl = new FeatureLayer({
            portalItem: { id: b.item.id },
            layerId: 0 // defaulting to 0-indx item in layer, will need to verify this choice
        });
        // console.log('feature layer created', fl)
        return fl
    });
    
    console.log('Layers to display in map: ', mapLayers)


    const map = new Map({
        basemap: "gray-vector",
        layers: assignLayerRenderers(mapLayers) // we'll only taje the 2 most recent
    });

    const view = new MapView({
        container: document.getElementById("mapEl"), // the dom element to hold our map
        map: map,
        ui: { components: [] }
    });

    return map;
    
}

