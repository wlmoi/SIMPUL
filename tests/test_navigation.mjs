import assert from 'node:assert/strict';
import { views } from '../js/data.js';
import { PRIMARY_ROUTES, TOOL_ROUTES, NAV_SECTIONS, sectionForRoute, renderNavigation, assertNavigationCoverage } from '../js/navigation.js';
import { renderSettings, setSettingsTab } from '../js/views/settings.js';
assert.equal(assertNavigationCoverage(),views.length,'Each page has exactly one menu location');
assert.deepEqual(PRIMARY_ROUTES,['overview','cctv','vehicles','diagnosis','simulation','evaluation']);
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
// Compact sidebar: on a main-flow page only the flow, tools and one collapsed "Fitur lanjutan" entry are visible.
assert.deepEqual(TOOL_ROUTES,['mapview','observation','settings']);
const home=renderNavigation('overview',null);
assert.match(home,/id="nav-more-panel" hidden/,'Advanced pages are collapsed by default');
assert.ok(!/nav-more-trigger/.test(home),'No "Fitur lanjutan" entry in the sidebar; advanced pages live in Pengaturan');
assert.match(renderNavigation('monitor',null),/data-route="settings" aria-current="page"/,'Pengaturan is highlighted while an advanced page is open');
// Every advanced page is reachable from Pengaturan; creators has its own tab.
setSettingsTab('fitur');
const hub=renderSettings();
for(const sec of NAV_SECTIONS.filter(s=>s.id!=='about'))for(const r of sec.routes)assert.ok(hub.includes(`data-route="${r}"`),r);
setSettingsTab('tim');
assert.match(renderSettings(),/About the Creators/);
setSettingsTab('data');
assert.match(renderSettings(),/Manajemen data/);
console.log('PASS: compact sidebar (flow + tools only), settings hub reaches every advanced page');
console.log('PASS: 26 navigable routes, one location each, grouped menus, active state and search input');
