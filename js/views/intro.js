/** Presentation-only introduction; stages describe the existing prototype workflow. */
import {getLanguage} from '../i18n.js';
const INTRO_STAGES={
 en:Object.freeze([
  {label:'Observe',title:'Start with what is visible.',text:'The CCTV AI records vehicle activity, stopping duration and queues automatically. Illustrative and real sources stay separate.',route:'cctv',cta:'Open CCTV AI'},
  {label:'Analyze',title:'Turn records into questions.',text:'Review patterns and evidence quality. The summary supports review; it does not determine violations or causation automatically.',route:'diagnosis',cta:'Open diagnosis'},
  {label:'Simulate',title:'Test options before changing the street.',text:'Compare A0, A1, and A2 under equivalent assumptions. The illustrative model is not calibrated for Fatmawati.',route:'simulation',cta:'Compare scenarios'},
  {label:'Evaluate',title:'People remain accountable for decisions.',text:'Review pedestrian access, queues, assumptions, and evidence quality. Use results for evaluation, not as proof of field impact.',route:'evaluation',cta:'Review evaluation'}
 ]),
 id:Object.freeze([
  {label:'Observasi',title:'Mulai dari yang terlihat.',text:'AI CCTV mencatat aktivitas kendaraan, durasi berhenti, dan antrean secara otomatis. Sumber nyata dan data ilustratif tetap dibedakan.',route:'cctv',cta:'Buka CCTV AI'},
  {label:'Analisis',title:'Ubah catatan menjadi pertanyaan.',text:'Periksa pola dan kualitas bukti. Ringkasan membantu peninjauan, bukan menetapkan pelanggaran atau sebab secara otomatis.',route:'diagnosis',cta:'Periksa diagnosis'},
  {label:'Simulasi',title:'Uji pilihan sebelum menata.',text:'Bandingkan A0, A1, dan A2 pada asumsi yang setara. Model ilustratif belum terkalibrasi untuk Fatmawati.',route:'simulation',cta:'Bandingkan skenario'},
  {label:'Evaluasi',title:'Keputusan tetap pada manusia.',text:'Tinjau akses pejalan, antrean, asumsi, dan mutu bukti. Gunakan hasil sebagai bahan evaluasi, bukan bukti dampak lapangan.',route:'evaluation',cta:'Tinjau evaluasi'}
 ])
};
export const INTRO_STAGE_DEFAULTS=INTRO_STAGES.en;
export function getIntroStages(){return INTRO_STAGES[getLanguage()];}
export function renderIntro(){const stages=getIntroStages(),english=getLanguage()==='en';return `<section class="simpul-intro" aria-labelledby="intro-title" data-intro-stage="0">
 <div class="intro-top"><span>${english?'SIMPUL TOUR / PROTOTYPE WALKTHROUGH':'KENALI SIMPUL / TUR PROTOTYPE'}</span><button type="button" class="intro-skip" data-action="intro-skip">${english?'Skip intro':'Lewati intro'} ↓</button></div>
 <div class="intro-grid"><div class="intro-copy" aria-live="polite" aria-atomic="true"><div class="intro-count" id="intro-count">01 / 04 / ${stages[0].label.toUpperCase()}</div><h2 id="intro-title">${stages[0].title}</h2><p id="intro-description">${stages[0].text}</p><button class="intro-link" id="intro-destination" data-route="${stages[0].route}">${stages[0].cta} ↗</button></div>
 <div class="intro-scene" aria-hidden="true"><div class="intro-station">MRT<span>FATMAWATI</span></div><div class="intro-road"><i class="intro-vehicle v1"></i><i class="intro-vehicle v2"></i><i class="intro-vehicle v3"></i></div><div class="intro-walk"><i></i><i></i><i></i></div><div class="intro-scan"></div><div class="intro-scene-label">ILUSTRASI ALUR / BUKAN DATA LIVE</div><div class="intro-node n1">01</div><div class="intro-node n2">02</div><div class="intro-node n3">03</div><div class="intro-node n4">04</div></div></div>
 <div class="intro-chapters" role="group" aria-label="${english?'Introduction stages':'Tahap pengenalan'}">${stages.map((stage,index)=>`<button type="button" data-action="intro-stage" data-index="${index}" aria-pressed="${index===0}"><span>0${index+1}</span>${stage.label}</button>`).join('')}</div>
 <div class="intro-bottom"><div class="intro-controls"><button type="button" data-action="intro-prev" aria-label="${english?'Previous stage':'Tahap sebelumnya'}">←</button><button type="button" class="intro-play-button" data-action="intro-play" aria-pressed="false">${english?'Play tour':'Putar tour'}</button><button type="button" data-action="intro-next" aria-label="${english?'Next stage':'Tahap berikutnya'}">→</button><button type="button" data-action="intro-replay">${english?'Replay':'Ulangi'}</button></div><small>${english?'Guided feature tour / under 3 min / pausable':'Tour fitur / kurang dari 3 menit / bisa dijeda'}</small></div>
 </section><div id="intro-end" tabindex="-1"></div>`;}
