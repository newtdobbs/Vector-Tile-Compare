import PortalItem from "@arcgis/core/portal/PortalItem";

const [Map, MapView] = await $arcgis.import(["@arcgis/core/Map.js", "@arcgis/core/views/MapView.js"]);
  const [Portal, OAuthInfo, esriId, PortalQueryParams] = await $arcgis.import([
    "@arcgis/core/portal/Portal.js",
    "@arcgis/core/identity/OAuthInfo.js",
    "@arcgis/core/identity/IdentityManager.js",
    "@arcgis/core/portal/PortalQueryParams.js",
]);


// require(["esri/portal/Portal", "esri/identity/OAuthInfo", "esri/identity/IdentityManager"], (Portal, OAuthInfo, esriId) => {
let info = new OAuthInfo({
    appId: 'LZ49XhZatXR6WAJO',
    portalUrl: 'https://arcgis-content.maps.arcgis.com', 
    flowType: "auto",
    popup: false,
});

esriId.registerOAuthInfos([info]);

esriId
.checkSignInStatus(info.portalUrl + "/sharing")
.then(createDefaultMap)
.catch(() => {
    console.log("Not logged in");
});

document.getElementById("sign-in-button").addEventListener("click", () => {
    esriId.getCredential(info.portalUrl + "/sharing");
});

export function createDefaultMap(){
    const params = new PortalQueryParams({
        query: "group:7818b0837c064c158b4cbf777570390d",
        num: 20
    });
    // async function handleLoginSuccess() {
    const portal = new Portal();
    portal.authMode = "immediate";
    portal.load().then(async () => {
        const results = await portal.queryItems(params);
        for (const layer in results.results){
            console.log('Layer:', results.results[layer].title, 'type:', results.results[layer].type)
        }
    });
};
