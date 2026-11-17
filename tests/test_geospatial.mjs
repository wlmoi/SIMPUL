import assert from 'node:assert/strict';
import {coordinatePair,mapCenter,zoneReferencePoints,studyZonePoints,STUDY_ZONES,STATION_REFERENCE} from '../js/geospatial.js';
for(const value of [null,undefined,'',' ',false,true,NaN,Infinity,'abc'])assert.equal(coordinatePair(value,106),null);
assert.equal(coordinatePair(91,106),null);assert.equal(coordinatePair(-6,181),null);
assert.deepEqual(coordinatePair(0,0),{lat:0,lon:0});
assert.deepEqual(coordinatePair('-6.29247','106.79245'),STATION_REFERENCE);
assert.deepEqual(mapCenter({geo:{lat:null,lon:null}}),STATION_REFERENCE);
assert.deepEqual(mapCenter({geo:{lat:'',lon:''}}),STATION_REFERENCE);
assert.deepEqual(mapCenter({geo:{lat:0,lon:0}}),{lat:0,lon:0});
assert.deepEqual(zoneReferencePoints({'Zona A':{lat:-6.2,lon:106.8},invalid:null,empty:{lat:'',lon:null},outside:{lat:100,lon:1}}),[{name:'Zona A',lat:-6.2,lon:106.8}]);
// Three default zone dots sit on the station-side carriageway, west to east (A, B, C), within ~150 m of the station.
assert.deepEqual(STUDY_ZONES.map(z=>z.name),['Zona A','Zona B','Zona C']);
assert.ok(STUDY_ZONES[0].lon<STUDY_ZONES[1].lon&&STUDY_ZONES[1].lon<STUDY_ZONES[2].lon,'Zones run west to east');
for(const z of STUDY_ZONES){const dx=(z.lon-STATION_REFERENCE.lon)*110650,dy=(z.lat-STATION_REFERENCE.lat)*110570;assert.ok(Math.hypot(dx,dy)<150,`${z.name} is near the station`);}
const merged=studyZonePoints({'Zona B':{lat:-6.29,lon:106.79}});
assert.equal(merged.length,3);assert.equal(merged[1].custom,true);assert.equal(merged[1].lat,-6.29);assert.equal(merged[0].custom,false);
console.log('PASS geospatial: explicit coordinates, empty-coordinate rejection, bounds, valid zero and zone provenance');
