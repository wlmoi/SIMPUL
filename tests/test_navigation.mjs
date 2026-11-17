import assert from 'node:assert/strict';
import { views } from '../js/data.js';
import { PRIMARY_ROUTES, NAV_SECTIONS, sectionForRoute, renderNavigation, assertNavigationCoverage } from '../js/navigation.js';
assert.equal(assertNavigationCoverage(),views.length,'Each page has exactly one menu location');
assert.deepEqual(PRIMARY_ROUTES,['overview','vehicles','observation','diagnosis','mapview','simulation','evaluation']);
assert.equal(sectionForRoute('monitor'),'field');
assert.equal(sectionForRoute('business'),'business');
assert.equal(sectionForRoute('simulation'),null);
const html=renderNavigation('monitor','field');
assert.match(html, /aria-expanded="true" aria-controls="nav-panel-field"/);
assert.match(html, /data-route="monitor" aria-current="page"/);
assert.match(html, /(?:Cari halaman|Search pages)/);
for(const page of views){
  const escaped=page.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  assert.equal((html.match(new RegExp(`data-route="${escaped}"`, 'g'))||[]).length,1,`${page.id} should appear exactly once`);
}
console.log('PASS: 25 navigable routes, one location each, grouped menus, active state and search input');
