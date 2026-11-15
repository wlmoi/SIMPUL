import assert from 'node:assert/strict';
import {filterDocumentRecords,mapPointsFromDocuments} from '../js/document-search.js';
const rows=[
 {id:'a',source:'uploaded_pdf',at:'2026-11-15T07:35:00+07:00',zone:'Zona A',vehicle:'Mobil',subcategory:'sedan',color:'Hitam',lat:-6.29247,lon:106.79245},
 {id:'b',source:'uploaded_pdf',at:'2026-11-15T08:20:00+07:00',zone:'Zona B',vehicle:'Mobil',subcategory:'suv',color:'Putih',lat:null,lon:null},
 {id:'c',source:'demo',at:'2026-11-15T07:35:00+07:00',zone:'Zona A',vehicle:'Mobil',color:'Hitam',lat:-6.29,lon:106.79},
];
assert.deepEqual(filterDocumentRecords(rows,{zone:'zona a',color:'hitam',vehicle:'sedan'}).map(x=>x.id),['a']);
assert.deepEqual(filterDocumentRecords(rows,{date:'2026-11-15',after:'08:00'}).map(x=>x.id),['b']);
assert.equal(filterDocumentRecords(rows,{date:'2026-11-14'}).length,0);
assert.equal(mapPointsFromDocuments(rows).length,1);
assert.equal(mapPointsFromDocuments(rows)[0].id,'a');
console.log('PASS document search: date/time/type/color/zone, explicit GPS only, synthetic exclusion');
