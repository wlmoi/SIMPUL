import {renderIntro} from './intro.js';
import {getState} from '../store.js';
import {icon,num,safe} from '../util.js';
import {eventByType,observationStats} from '../analytics.js';
import {pageHead,cardHeading,note,button,tag} from './shared.js';
import {t,getLanguage} from '../i18n.js';

const CCTV_URL='https://jakcctv.jakarta.go.id/publik';

export function miniMap(){
 return `<div class="overview-map-wrap"><div class="map-frame"><svg viewBox="0 0 620 330" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#d8e1e9" stroke-width=".8"/></pattern></defs><rect width="620" height="330" fill="url(#grid)"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#cbdbe1" stroke-width="52" fill="none"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#fff" stroke-width="36" fill="none"/><path d="M-40 250 C180 225 270 175 640 98" stroke="#d9e5e9" stroke-width="2" stroke-dasharray="7 7" fill="none"/><path d="M120 -40C175 95 265 245 360 380" stroke="#d3dee4" stroke-width="38" fill="none"/><path d="M120 -40C175 95 265 245 360 380" stroke="#fff" stroke-width="24" fill="none"/><path d="M450 -50C430 55 490 215 530 370" stroke="#d1e0e5" stroke-width="29" fill="none"/><path d="M450 -50C430 55 490 215 530 370" stroke="#fff" stroke-width="18" fill="none"/><path d="M20 40h100M270 275h85M460 35h80" stroke="#b6c4cf" stroke-width="6" opacity=".45"/><path d="M210 225 380 190" stroke="#0c5795" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 12"/></svg><div class="overview-map-nodes" role="group" aria-label="${t('map.selectNode')}"><button type="button" class="overview-map-node node-station" data-action="select-overview-node" data-node="station" aria-label="${t('map.station')}"><i></i><span>${t('map.station')}</span></button><button type="button" class="overview-map-node node-zone-a" data-action="select-overview-node" data-node="zoneA" aria-label="${t('map.zoneA')}"><i></i><span>${t('map.zoneA')}</span></button><button type="button" class="overview-map-node node-zone-b" data-action="select-overview-node" data-node="zoneB" aria-label="${t('map.zoneB')}"><i></i><span>${t('map.zoneB')}</span></button><button type="button" class="overview-map-node node-pickup" data-action="select-overview-node" data-node="pickup" aria-label="${t('map.pickup')}"><i></i><span>${t('map.pickup')}</span></button></div><div class="map-label"><i class="pin"></i> ${t('overview.locationDescription')}</div></div><div class="overview-node-inspector" id="overview-node-inspector" aria-live="polite"><div><span class="overview-node-kicker">${t('map.station')}</span><strong>${t('map.stationDetail')}</strong></div><a href="${CCTV_URL}" target="_blank" rel="noopener noreferrer">${icon('video',14)} ${t('map.cctv')}</a></div></div>`;
}

function heroMap(){
 const scenes=[['A0','Existing'],['A1','Pickup area'],['A2','Stopping rule']];
 return `<div class="corridor-lab" data-scene="A0"><div class="scene-label">EXPLORE / ILLUSTRATIVE 3D SCENE</div><div class="corridor-perspective" aria-label="Illustrative road, station, and pickup area"><div class="corridor-ground"><div class="corridor-road"></div><div class="corridor-walk">PEDESTRIAN ACCESS</div><div class="corridor-station">MRT</div><div class="corridor-bay">PICKUP AREA</div><i class="scene-car car-one"></i><i class="scene-car car-two"></i><i class="scene-car car-three"></i></div></div><div class="scene-switch" role="group" aria-label="Explore illustrative alternatives">${scenes.map((x,i)=>`<button type="button" data-action="scene-alternative" data-scene="${x[0]}" aria-pressed="${i===0}">${x[0]}</button>`).join('')}</div><p class="scene-description" aria-live="polite">A0: ${t('overview.a0Text')}</p><small>Illustrative geometry. Alternative impacts are calculated in Simulation.</small></div>`;
}

export function renderOverview(){
 const s=getState(),stats=observationStats(s.observations),manual=s.observations.filter(o=>o.source==='manual').length,interval=(s.fieldReadings||[]).filter(o=>o.source==='manual').length,reviewed=(s.sessions||[]).filter(x=>x.source==='manual'&&x.status==='Selesai').length,evidenceReady=manual>0&&interval>0;
 const steps=t('overview.steps').map((title,i)=>[title,t('overview.stepBodies')[i],['car-front','scan-search','git-compare-arrows','clipboard-check'][i],['vehicles','diagnosis','simulation','evaluation'][i],t('overview.stepActions')[i]]);
 const en=getLanguage()==='en';
 return `<section class="mc-hero">
  <div class="mc-hero-copy">
   <div class="mc-eyebrow"><span class="mc-live-dot"></span> SI BRIDGES INDONESIA 2026 · MRT FATMAWATI, JAKARTA SELATAN</div>
   <h1>${en?'Vehicles stop. Queues form. <em>MRT access suffers.</em>':'Kendaraan berhenti. Antrean terbentuk. <em>Akses MRT terdampak.</em>'}</h1>
   <p>${en?'SIMPUL uses CCTV and AI to see where pickup vehicles stop, then simulates the best street arrangement before it is applied on the road.':'SIMPUL memakai CCTV dan AI untuk melihat di mana kendaraan penjemput berhenti, lalu mensimulasikan penataan terbaik sebelum diterapkan di jalan.'}</p>
   <div class="mc-actions">
    <button type="button" class="btn mc-cta" data-route="cctv">${icon('cctv',18)} ${en?'Open CCTV AI':'Lihat CCTV AI'}</button>
    <button type="button" class="btn mc-ghost" data-route="simulation">${icon('git-compare-arrows',18)} ${en?'Run simulation':'Jalankan simulasi'}</button>
   </div>
   <div class="mc-trust">${icon('shield-check',15)} ${en?'No licence plates or faces · Example data is synthetic':'Tanpa plat nomor &amp; wajah · Data contoh bersifat sintetis'}</div>
  </div>
  <div class="mc-preview">
   <div class="mc-preview-top"><span><i class="mc-rec"></i> ${en?'LIVE 3D SIMULATION · FATMAWATI':'SIMULASI 3D LANGSUNG · FATMAWATI'}</span><span>AI virtual</span></div>
   <div class="mc-preview-scene">
    <canvas class="mc-canvas" data-home-canvas aria-label="${en?'3D simulation of the MRT Fatmawati area':'Simulasi 3D kawasan Stasiun MRT Fatmawati'}"></canvas>
    <div class="mc-kpis"><span data-home-kpi="speed">${en?'Speed':'Kecepatan'} <b>–</b></span><span data-home-kpi="queue">${en?'Queue':'Antrean'} <b>–</b></span><span data-home-kpi="blocked">${en?'Stopped in lane':'Berhenti di lajur'} <b>–</b></span></div>
   </div>
   <div class="mc-preview-foot">
    <div class="mc-switch" role="group" aria-label="Skenario">${['A0','A1','A2'].map(x=>`<button type="button" data-home-scenario="${x}" aria-pressed="${x==='A0'}">${x}</button>`).join('')}</div>
    <small data-home-caption></small>
    <button type="button" class="mc-open" data-route="cctv">${en?'Open full view':'Buka penuh'} ${icon('arrow-up-right',15)}</button>
   </div>
  </div>
 </section>
 <div class="mc-stats">
  <div><strong>${stats.count}</strong><span>${en?'Recorded events':'Kejadian tercatat'}</span></div>
  <div><strong>3</strong><span>${en?'Pickup zones monitored':'Zona penjemputan dipantau'}</span></div>
  <div><strong>A0 · A1 · A2</strong><span>${en?'Street alternatives tested':'Alternatif penataan diuji'}</span></div>
  <div><strong>${manual}</strong><span>${en?'Manual field observations':'Observasi lapangan manual'}</span></div>
 </div>
 ${renderIntro()}
 <div class="section-h solution-heading"><h2>${t('overview.flowTitle')}</h2><small>${t('overview.flowLabel')}</small></div>
 <div class="solution-steps">${steps.map((x,i)=>`<article class="solution-step"><div class="solution-step-top"><span>0${i+1}</span>${icon(x[2],21)}</div><h3>${x[0]}</h3><p>${x[1]}</p><button type="button" data-route="${x[3]}">${x[4]} ${icon('arrow-right',16)}</button></article>`).join('')}</div>
 <div class="section-h"><h2>${t('overview.evidenceTitle')}</h2><small>${t('overview.evidenceLabel')}</small></div>
 <section class="solution-evidence"><div class="solution-evidence-head"><div><span class="solution-kicker">SOURCE & QUALITY GATE</span><h3>${evidenceReady?t('overview.evidenceReady'):t('overview.evidenceEmpty')}</h3><p>${evidenceReady?t('overview.evidenceReadyText'):t('overview.evidenceEmptyText')}</p></div><span class="solution-state">${evidenceReady?t('overview.review'):t('overview.notValidated')}</span></div><div class="solution-evidence-metrics"><div><strong>${manual}</strong><span>${t('overview.manualEvents')}</span></div><div><strong>${interval}</strong><span>${t('overview.manualIntervals')}</span></div><div><strong>${reviewed}</strong><span>${t('overview.sessions')}</span></div><div><strong>${stats.synthetic}</strong><span>${t('overview.illustrative')}</span></div></div><div class="solution-evidence-actions">${button(`${t('overview.record')} ${icon('arrow-right',16)}`,'goto-observation','primary')}${button(t('overview.survey'),'goto-survey')}${button(t('overview.quality'),'goto-standards')}</div></section>
 <div class="solution-two-col"><section class="card solution-map-card">${cardHeading(t('overview.locationTitle'),t('overview.locationDescription'),tag('STUDY LOCATION','slate'))}${miniMap()}<div class="solution-link-row"><button type="button" data-route="mapview">${icon('map',16)} ${t('overview.map')} ${icon('arrow-right',15)}</button><button type="button" data-route="documents">${icon('file-text',16)} ${t('overview.pdf')} ${icon('arrow-right',15)}</button></div></section><section class="card solution-options">${cardHeading(t('overview.optionsTitle'),t('overview.optionsDescription'))}<div class="solution-option"><b>A0</b><div><strong>${t('overview.a0')}</strong><p>${t('overview.a0Text')}</p></div></div><div class="solution-option"><b>A1</b><div><strong>${t('overview.a1')}</strong><p>${t('overview.a1Text')}</p></div></div><div class="solution-option"><b>A2</b><div><strong>${t('overview.a2')}</strong><p>${t('overview.a2Text')}</p></div></div>${button(`${t('overview.compare')} ${icon('arrow-right',15)}`,'goto-simulation','primary')}<p class="solution-limit">${t('overview.limit')}</p></section></div>
 <section class="solution-secondary"><div><span class="solution-kicker">SUPPORTING FEATURES</span><h3>${t('overview.supportTitle')}</h3><p>${t('overview.supportText')}</p></div><div class="solution-secondary-links"><button type="button" data-route="monitor">${icon('activity',16)} ${t('overview.monitoring')}</button><button type="button" data-route="classification">${icon('clipboard-list',16)} ${t('overview.classification')}</button><button type="button" data-route="reports">${icon('files',16)} ${t('overview.reports')}</button><button type="button" data-route="business">${icon('chart-no-axes-combined',16)} ${t('overview.business')}</button></div></section>
 ${note(`<strong>${t('overview.integrity')}</strong>`)}<section class="solution-credits"><div><span class="solution-kicker">THE PEOPLE BEHIND SIMPUL</span><h3>${t('overview.creatorsTitle')}</h3><p>${t('overview.creatorsText')}</p></div><button type="button" data-route="creators" class="btn primary">${t('overview.creatorsAction')} ${icon('arrow-right',17)}</button></section>`;
}
