import { ApiKeyManager } from "@esri/arcgis-rest-request";

export const auth = ApiKeyManager.fromKey("aRxvV6lTKmABIjeaauUcCrA..PB04uN2qq_xHWcoRfFNGgNQXCKVQAxsoan8_FploIShPEjH7vTETaGXlP_7xmlZV9zFc0ngAtcTpoolC6OBONMXpYmxw5Xbo8Dcl0hqC2Rcdj3gbUw-jUh1-EUvREaBq7OH_LzQaEr5fthg.");

// fields to ignore
const ignoreFields = [
  "OBJECTID",
  "LOD",
  "ROW",
  "COL",
  "LEAF",
  "SIZE",
  "x",
  "y",
  "UniqueID"
]

 