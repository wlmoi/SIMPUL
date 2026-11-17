/** Explicit WGS84 coordinates only. No device-location or vehicle inference. */
export const STATION_REFERENCE = Object.freeze({lat:-6.29247,lon:106.79245});
export function coordinatePair(lat,lon){
 const numeric=v=>(typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v));
 if(!numeric(lat)||!numeric(lon))return null;
 const point={lat:Number(lat),lon:Number(lon)};
 return Math.abs(point.lat)<=90&&Math.abs(point.lon)<=180?point:null;
}
/**
 * Default positions of the three study zones on the station-side carriageway of
 * Jl. R.A. Kartini, under/next to the elevated MRT Fatmawati station. Derived from
 * the SIMPUL 3D layout (js/fatmawati-layout.js, zone centres x=-113 m, 0 m, +36 m
 * from the station centre, kerb lane) placed on OpenStreetMap geometry (station node
 * 6577753462, kerb-side westbound carriageway). Schematic: verify on site.
 */
export const STUDY_ZONES = Object.freeze([
 Object.freeze({name:'Zona A',lat:-6.29251,lon:106.79144}),
 Object.freeze({name:'Zona B',lat:-6.29252,lon:106.79246}),
 Object.freeze({name:'Zona C',lat:-6.29252,lon:106.79279})
]);
/** Study zones for the map: an observer-placed pin overrides the default position of that zone. */
export function studyZonePoints(pins){
 const custom=new Map(zoneReferencePoints(pins).map(p=>[p.name,p]));
 return STUDY_ZONES.map(z=>custom.has(z.name)?{...custom.get(z.name),custom:true}:{...z,custom:false});
}
export function mapCenter(project){return coordinatePair(project?.geo?.lat,project?.geo?.lon)||{...STATION_REFERENCE};}
export function zoneReferencePoints(pins){
 return Object.entries(pins&&typeof pins==='object'?pins:{}).flatMap(([name,p])=>{
  const point=coordinatePair(p?.lat,p?.lon);return point?[{name,...point}]:[];
 });
}
