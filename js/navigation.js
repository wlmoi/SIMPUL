/**
 * SIMPUL navigation information architecture.
 *
 * Navigation only: routes and feature implementations remain in js/data.js
 * and js/page-registry.js. This module never mutates observations, AI, or SUMO.
 * To add a page, register it in data.js + page-registry.js, assign exactly one
 * section below, and run `node tests/test_navigation.mjs`.
 */
import { views } from './data.js';
import { icon, safe } from './util.js';
import {labelForRoute,labelForGroup,getLanguage} from './i18n.js';

export const PRIMARY_ROUTES = Object.freeze([
  'overview', 'vehicles', 'observation', 'diagnosis', 'mapview', 'simulation', 'evaluation'
]);

export const NAV_SECTIONS = Object.freeze([
  { id:'field', label:'Survei & operasional', icon:'clipboard-list', routes:['survey','monitor','classification','operations'] },
  { id:'context', label:'Data & konteks', icon:'map-pinned', routes:['documents','context','contextplus','insights','publicintel'] },
  { id:'business', label:'Model bisnis', icon:'chart-no-axes-combined', routes:['business','pipeline','equipment'] },
  { id:'evidence', label:'Dokumentasi & bukti', icon:'files', routes:['project','standards','reports'] },
  { id:'system', label:'Integrasi & sistem', icon:'settings-2', routes:['integrations','settings'] },
  { id:'about', label:'Tentang pembuat', icon:'users', routes:['creators'] }
]);

const pages = new Map(views.map(page=>[page.id,page]));
export function sectionForRoute(route){return NAV_SECTIONS.find(section=>section.routes.includes(route))?.id || null;}
export function sectionTitleForRoute(route){const section=NAV_SECTIONS.find(item=>item.routes.includes(route));return section?labelForGroup(section.id,section.label):(PRIMARY_ROUTES.includes(route)?(getLanguage()==='en'?'Primary flow':'Alur utama'):(getLanguage()==='en'?'Workspace':'Workspace'));}
export function assertNavigationCoverage(){
  const ids=[...PRIMARY_ROUTES,...NAV_SECTIONS.flatMap(s=>s.routes)];
  if(ids.length!==new Set(ids).size)throw new Error('A navigation route is assigned more than once');
  const missing=views.filter(page=>!ids.includes(page.id)).map(p=>p.id);
  const invalid=ids.filter(id=>!pages.has(id));
  if(missing.length||invalid.length)throw new Error(`Navigation mismatch: missing=${missing.join(',')} unknown=${invalid.join(',')}`);
  return ids.length;
}

function link(route,active,number=null){
  const page=pages.get(route);
  if(!page)throw new Error('Missing navigation page: '+route);
  const selected=active===route;
  const label=labelForRoute(page.id,page.label);
  return `<div class="nav-item-wrap" data-nav-page="${page.id}" data-nav-label="${safe(label.toLowerCase())}"><button type="button" class="nav-link ${selected?'active':''}" data-route="${page.id}" ${selected?'aria-current="page"':''}>${icon(page.icon,17)}<span>${safe(label)}</span>${number?`<span class="nav-step">${number}</span>`:''}</button></div>`;
}

/** Return sidebar navigation content only; the outer shell is owned by app.js. */
export function renderNavigation(active,expanded=''){
  const core=PRIMARY_ROUTES.map((route,i)=>link(route,active,String(i+1).padStart(2,'0'))).join('');
  const sections=NAV_SECTIONS.map(section=>{
    const selected=section.routes.includes(active);
    const open=expanded===section.id;
    const label=labelForGroup(section.id,section.label);
    return `<div class="nav-fold ${selected?'has-active':''}" data-nav-section="${section.id}">
      <button type="button" class="nav-fold-trigger" data-action="toggle-nav-group" data-group="${section.id}" aria-expanded="${open}" aria-controls="nav-panel-${section.id}">
        ${icon(section.icon,17)}<span>${safe(label)}</span><span class="nav-fold-count">${section.routes.length}</span>${icon('chevron-down',15)}
      </button>
      <div class="nav-fold-content" id="nav-panel-${section.id}" ${open?'':'hidden'}>${section.routes.map(route=>link(route,active)).join('')}</div>
    </div>`;
  }).join('');
  const english=getLanguage()==='en';
  return `<div class="nav-search">${icon('search',16)}<input id="simpul-nav-search" type="search" autocomplete="off" placeholder="${english?'Search pages... (/)':'Cari halaman... (/)' }" aria-label="${english?'Search SIMPUL pages':'Cari halaman SIMPUL'}"/></div>
    <div class="nav-items"><div class="nav-label" data-nav-core-heading>ALUR UTAMA</div><div class="nav-core">${core}</div>
    <div class="nav-label nav-label-secondary">FITUR PENDUKUNG</div><div class="nav-sections">${sections}</div>
    <p class="nav-empty" hidden>Tidak ada halaman yang cocok.</p></div>`;
}

/** Search only changes navigation visibility; feature state is never affected. */
export function filterNavigation(root, query){
  if(!root)return 0;
  const q=String(query||'').trim().toLocaleLowerCase('id-ID');
  root.classList.toggle('is-searching',Boolean(q));
  let count=0;
  root.querySelectorAll('[data-nav-page]').forEach(el=>{
    const match=!q || (el.dataset.navLabel||'').toLocaleLowerCase('id-ID').includes(q);
    el.hidden=!match;
    if(match)count++;
  });
  root.querySelectorAll('[data-nav-section]').forEach(el=>{
    el.hidden=Boolean(q)&&![...el.querySelectorAll('[data-nav-page]')].some(item=>!item.hidden);
  });
  const core= root.querySelector('.nav-core');
  const coreVisible=[...(core?.querySelectorAll('[data-nav-page]')||[])].some(item=>!item.hidden);
  if(core)core.hidden=Boolean(q)&&!coreVisible;
  const label=root.querySelector('[data-nav-core-heading]');if(label)label.hidden=Boolean(q)&&!coreVisible;
  const empty=root.querySelector('.nav-empty');if(empty)empty.hidden=count!==0;
  return count;
}
