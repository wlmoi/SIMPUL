import assert from 'node:assert/strict';
import { views, initialData } from '../js/data.js';
import { pageRenderers } from '../js/page-registry.js';
import { encodeCsvCell, encodeCsvRows } from '../js/services/csv.js';
import { policeCsv, equipmentCsv, forecastCsv, observationCsv } from '../js/services/export-data.js';

const configuredPages = views.map(v => v.id);
assert.equal(configuredPages.length, 25, 'All 25 routes including the final creators page must be registered');
assert.equal(new Set(configuredPages).size, configuredPages.length, 'Route IDs must be unique');
assert.deepEqual(new Set(Object.keys(pageRenderers)), new Set(configuredPages));
for (const page of views) {
  assert.equal(typeof pageRenderers[page.id], 'function', `Missing renderer for ${page.id}`);
  assert.ok(page.label && page.group && page.icon);
}
assert.equal(encodeCsvCell('A,"B"'), '"A,""B"""');
assert.equal(encodeCsvRows([['a','b'],['x','y']]), '\ufeff"a","b"\r\n"x","y"\r\n');
const state = initialData();
assert.equal(policeCsv(state).includes('evt-1001'), false, 'Never export demo as police records');
assert.ok(observationCsv(state).includes('evt-1001'), 'General observation CSV still includes explicit demo rows');
state.observations.push({
  id:'field-001',at:'2026-11-15T01:00:00Z',type:'Jemput',vehicle:'Mobil',
  zone:'Zona A',duration:30,source:'manual',pedestrianBlocked:'yes',
});
assert.ok(policeCsv(state).includes('field-001'), 'Manual observation remains exportable');
assert.ok(policeCsv(state).includes('P1'), 'Operational priority retained');
assert.ok(!policeCsv(state).includes('evt-1001'), 'Demo still excluded');
assert.ok(forecastCsv(state).includes('operating_result_idr'));
assert.ok(equipmentCsv(state).includes('Smartphone'));
assert.throws(()=>equipmentCsv({...state,equipmentMode:'invalid'}), /Unknown equipment mode/);
console.log('PASS: 25 routes, page registry, CSV integrity, manual-only police export, finance and equipment exports');
