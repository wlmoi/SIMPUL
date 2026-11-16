/** Explicit WGS84 coordinates only. No device-location or vehicle inference. */
export const STATION_REFERENCE = Object.freeze({lat:-6.29247,lon:106.79245});
export function coordinatePair(lat,lon){
 const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
 if(!numeric(lat)||!numeric(lon))return null;
 const point={lat:Number(lat),lon:Number(lon)};
 return Math.abs(point.lat)<=90&&Math.abs(point.lon)<=180?point:null;
}
export function mapCenter(project){return coordinatePair(project?.geo?.lat,project?.geo?.lon)||{...STATION_REFERENCE};}
export function zoneReferencePoints(pins){
 return Object.entries(pins&&typeof pins==='object'?pins:{}).flatMap(([name,p])=>{
  const point=coordinatePair(p?.lat,p?.lon);return point?[{name,...point}]:[];
 });
}
