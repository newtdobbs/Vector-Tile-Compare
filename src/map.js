import PortalItem from "@arcgis/core/portal/PortalItem";
import LocateSettingSource from "@arcgis/core/rest/support/LocateSettingSource";
import { appState } from "../state";
import "../style.css";

const [Map, MapView] = await $arcgis.import(["@arcgis/core/Map.js", "@arcgis/core/views/MapView.js"]);
const PictureMarkerSymbol = await $arcgis.import("@arcgis/core/symbols/PictureMarkerSymbol.js");
  const [Portal, OAuthInfo, esriId, PortalQueryParams, WebMap] = await $arcgis.import([
    "@arcgis/core/portal/Portal.js",
    "@arcgis/core/identity/OAuthInfo.js",
    "@arcgis/core/identity/IdentityManager.js",
    "@arcgis/core/portal/PortalQueryParams.js",
    "@arcgis/core/WebMap.js"
]);
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const FeatureEffect = await $arcgis.import("@arcgis/core/layers/support/FeatureEffect.js");
const FeatureFilter = await $arcgis.import("@arcgis/core/layers/support/FeatureFilter.js");


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
   const allTileStats = results.results.filter(item => item.isLayer && item.title.includes("Esri Vector Basemap Tile Statistics"));
//    console.log('All tile stats', allTileStats)

   return allTileStats;
};


export async function createDefaultMap(layerItems) {
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

    console.log('Sorted Esri Basemap Tile Statistics: ', basemapTileStatistics) // log for debug

    appState.allTileLayers = basemapTileStatistics // assigning all basemap tile statistic layers to state
    // console.log("ASSINGING APP STATE ALL TILE LAYERS AS", appState.allTileLayers)

    const [newerItem, olderItem] = basemapTileStatistics.slice(0,2); // grabbing the two most recent tile statistics
    appState.bottomLayer = new FeatureLayer({ portalItem: { id: newerItem.item.id } });;// assigning the bottom layer to the newer one
    // console.log('APP STATE BOTTOM LAYER', appState.bottomLayer)
   
    appState.topLayer = new FeatureLayer({ portalItem: { id: olderItem.item.id } });; // and assigning the top layer to the older one 
    // console.log('APP STATE TOP LAYER', appState.topLayer)
    
    const map = new Map({ basemap: "dark-gray-vector" });
    
    const symbolSize = 5;
    
    // console.log('assigning new (red) renderer for the bottom layer')
    appState.bottomLayer.when(() => {
        appState.bottomLayer.renderer = {
            type: "simple",
            symbol: new PictureMarkerSymbol({
                angle: 0,
                height: symbolSize,
                url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDkvMjEvMTfORjJUAAAFTElEQVRogd2abXLbNhCGX4CkPli3nbg9QUYHyB38L5OcNvrrm3h8g1ppUlOiIAD9IYJeLXcBytN0xsHMDiCJIvfhu4sv0kAp3nsYY2CMQYwRAGA+fTLDz2YwZOpSiZk6AkDcbiOA0YcYI6qqEk8mXjRBjAedAThE6XMJgjsufb4AAqDCTC5IIQQFrrE5INfYCCTBXFxQgNDMspq3tTCT7npgNW9fmAYzXqgAwR23xAxr55SRnAvEotCegEkwExAGwQEqUtuMzQEJGfPDMR4KUNxu4wRkBkSySqj5d9eCeFJ74TtJsQlMzS6kQXDHk9Xss6QMB5HufrLTUJuhBjtHGM4byPnOBzE1NBUk52vWloByIBLAibU9s4k6SRXjvYf9/JkqQfPBCs42BIK2JRgNhEMkc6zNIWn+jEDhy5dYk4GP5wdVgzrbKMZh0jlo4WpQpx2mStIbQbvuQHyNxhiY+PEjd14CaEi9GIy3uTo5EK6CA3AcjLe5UmKYpWTPqZGAqONLVlOYBMTvLg0HCpAc11RMN0Aag0ZVagYhKUNVSc5LxpXheULzgytBj+XhxMcRi2l4Gdr98l5LCi8KsxqMwyxwmSsUhOZGCh+plysNmBQIGC4oKcLDSlJkxYwrkwNxyCunDZgc5kIRLawoEFWDw6wHo8rMAdFUk8YZPxznmX8jjJTs14ZWAqGq0LvNQVJ+0G6aK8HHl3qoE8xkYpoUoTClbpiqwsMrwdA8kUCOyPdotDOQxibeMYiKaNMTSRkpZ5YwZglrF6iqhtzxAO8dQjgiRgkiARwhD7AayKgIBymNJzmYJapqjapq0TQtmmYNa5szRnBwbg/nOnhv4T2FSHlDO4Hc/C0bWjllSkBnM2aBqmqxXP6Otr3F7e1vWK8XAID9/oinp2/ouif0PRCCR4wp1LRpjjaj5uONmuxz1JlCWbtE0/yCtv0D79//ibu7G2w259B6eAi4v1/i8dEghBO8P8L7lAvc+TkqiKHFyzVQL21jajTNGu/e/Yq7uxt8+FBhtTqf8eamAnCD3a5H3/+NvudJfI3zkyLNa+YCTc3aCtZWaNsFNhs7QgDAagVsNhZtu4C1Naytrj5/ppRA3kwpgVy39xSCRwgeXXfEw0PA4fBypsPhnCdddxyPe8Xella0HMmdjE8hXtoxnuDcHrvdd9zfLwHwZP8Hu913OLdHjHxtwdcZVwElkNKd0OY/l6u8EHo494yu+wuPjxFfv/Zi9+vcM0LoIS+YpDV6UamaEeb2nWTn6VQixgred8M44dD335QBsUOMR/Z/DYr7ISkTc4rMAUjTiZepuPdACAHeH+HcM+QpSg+AGl3aloBURXJKlCDo+vxl7hTj2Wnvc5PGHsDhlTATZWho5UAoBAfQJoClaXwCOBDjQNkNB+q7FloaRA19jU3/M2dhRUNrL8BoykjhNSpSSnBpMcSVoMfOAUnhRVWRwkxT5AJICy26pDxBn4GC/UeaBJY2H6gyHIaqwnMlG1p0k5g6p21O896N5tA120FSLyaFlrgrD0xDKx1gcLk2Lu050Z2R127QJSBa5xL+wm+t++UgJ0wLV+1HbpmWxhOYEAJ9pJDbePg/NrG1kT7XDYe43cY6xpi0l1QBpuEETHODjhs/6rGCqsb4fOSneNADgD5DpEnNYXJQuY0CDSQHxJ0XR/W43QbtGSKfCQfhNz54UsjcTgf9L1dGWt+oAMTGMl7op3g8TUEAvO0XBmbA5MB4W+rxEggHkpxVV4XFVzgyMOm4/2zrRnOyYPNfqpFgCJAElfs8B4RDSZCve82Jw7yVF8/+BQoHPohDgtP1AAAAAElFTkSuQmCC",
                width: symbolSize,
                xoffset: 0,
                yoffset: 0
            })
        };
    });
    // console.log('assigning old (blue) renderer for the top layer')
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
    
    // console.log('assigning feature filters and feature effect')
    for (const l of [appState.topLayer, appState.bottomLayer]) {
        l.definitionExpression = "Building > 0";
        
        const featureFilter = new FeatureFilter({
            where: "SIZE > 40000"
        });
        
        l.when(() => {
            l.featureEffect = new FeatureEffect({
                filter: featureFilter,
                includedEffect: "bloom(1.3 0.6pt 0)",
                excludedEffect: "opacity(0.35)"
            });
        }); // Wait for layer to be ready
        
    }

    // assigning the renderers to state, these renderers shouldn't change when layers are swqpped
    appState.topRenderer = appState.topLayer.renderer;
    appState.bottomRenderer = appState.bottomLayer.renderer;

    // adding layers to map after applying effects (just to be safe with the order)
    map.add(appState.bottomLayer)
    map.add(appState.topLayer)
    
    const view = new MapView({
        container: document.getElementById("mapEl"), // the dom element to hold our map
        map: map,
        ui: { components: [] }
    });

    view.when(() => {
        view.goTo({ 
            target: [137.421641, 35.918028],
            zoom: 6
        });
    })

    appState.map = map;
    return map;
}
export async function changeFilterField(){

}

export async function changeMapLayers(layerKey, portalItem){
    const currentLayer = appState[layerKey] // this would be top or bottom layer
    const map = appState.map;
    const layerIndex = map.layers.indexOf(currentLayer) // the index of the layer we want to replace within the map

    // creating a new feature layer for the portal item from app state
    const replacementLayer = new FeatureLayer({
        portalItem: {id: portalItem.id}
    })
    console.log('replacement layer created as:', replacementLayer)

    await replacementLayer.load();

    if (currentLayer.renderer){
        replacementLayer.renderer = currentLayer.renderer.clone?.() ?? currentLayer.renderer;
    }

    replacementLayer.definitionExpression = currentLayer.definitionExpression; // inheriting definition expression for the replacement
    replacementLayer.visible = currentLayer.visible; // also inheriting visibility 
    if (currentLayer.featureEffect) { // also inheriting the featureeffect
        replacementLayer.featureEffect =
        currentLayer.featureEffect.clone?.() ?? currentLayer.featureEffect;
    }

    map.remove(currentLayer); // removing the layer
    map.add(replacementLayer, layerIndex) // addinmg the replacement layer at its relevant index
    appState[layerKey] = replacementLayer;
}

// export async function changeMapLayers(layerToRemove, layerToAdd){
//     // this should just use toplayer or bottom layer as an arg and pull from state
//     console.log(`app state ${layerToRemove} before change`, appState[layerToRemove])
    
//     // create a feature layer for it
//     console.log('layer to add', layerToAdd)
//     const replacementLayer = new FeatureLayer({ portalItem: layerToAdd })
//     // assign the relevant renderer to it
//     replacementLayer.when(() => {
//         console.log('replacement layer is ready')
//        replacementLayerrenderer = appState[layerToRemove].renderer 
//     });
//     console.log('REPLACEMENT LAYER', replacementLayer)
//     // assign it to state
//     appState[layerToRemove] = replacementLayer;
//     // recreate the map with the new layer
//     console.log(`app state ${layerToRemove} after change`, appState[layerToRemove])
// }

