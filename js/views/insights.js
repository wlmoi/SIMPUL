import {getState} from '../store.js';import {observationStats,heuristicSimulation,rankScenarios} from '../analytics.js';import {buildDeterministicBrief} from '../decision-brief.js';import {icon,num,safe} from '../util.js';import {pageHead,note,cardHeading,button,tag} from './shared.js';
function renderBriefStatusBanner(res,offlineFile){
  const st=offlineFile?'unavailable':(res.llmStatus||'unavailable');
  if(st==='ok')return tag(`Synthesis + Deterministic Guardrails (${safe(res.llmModel||'Gemini')})`,'green');
  if(st==='validation_failed'||st==='error')return tag('Deterministic Fallback (LLM validation failed / error)','red');
  return tag('Offline / Deterministic Only (LLM unavailable)','gold');
}
function formatParamsSummary(p={}){
  return Object.entries(p).map(([k,v])=>`${safe(k)}=${safe(String(v))}`).join(' · ');
}
function renderDecisionBriefCard(s){
  const offlineFile=typeof location!=='undefined'&&location.protocol==='file:';
  const briefRes=s.decisionBrief||(offlineFile?buildDeterministicBrief(s):null);
  const cvCount=Array.isArray(s.cvReviewedSummaries)?s.cvReviewedSummaries.length:0;
  if(!briefRes){
    return `<section class="card" style="margin-bottom:17px">${cardHeading('Coordinator Decision Brief','Ringkasan terpadu lintas bukti manual, jendela CV bertanda koordinator, PDF, dan konteks',tag('SIAP DISUSUN','slate'))}
    <p class="muted" style="font-size:12px;margin:0 0 12px">Menjalankan <em>Deterministic Pre-Flight Gate</em> secara lokal terlebih dahulu, lalu menggabungkan sintesis terikat batas skenario (${cvCount} jendela AI tercatat). Tanpa catatan bebas atau identitas pribadi.</p>
    <div class="form-actions">${button(`${icon('sparkles')} Susun Decision Brief Terpadu`,'ai-decision-brief','primary')}</div></section>`;
  }
  const b=briefRes.brief||{};
  const gaps=Array.isArray(b.contradictionsAndGaps)?b.contradictionsAndGaps:[];
  const hyps=Array.isArray(b.scenarioHypotheses)?b.scenarioHypotheses:[];
  const checks=Array.isArray(b.inspectionChecklist)?b.inspectionChecklist:[];
  const bay=b.bayUtilization;
  const trace=briefRes.executionTrace||{};
  const pdf=briefRes.pdfSummary||{available:false,totalRecords:0,byZonePeriod:{}};
  const prov=trace.providerStatuses||{};
  return `<section class="card" style="margin-bottom:17px">${cardHeading('Coordinator Decision Brief','Pre-flight deterministik + sintesis terbatas dengan audit trace',renderBriefStatusBanner(briefRes,offlineFile))}
  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px">
    ${tag(`legalConclusion: ${safe(b.legalConclusion||'NOT_DETERMINED')}`,'slate')}
    ${tag(`CV windows: ${cvCount}`,'blue')}
    ${bay?tag(`Area A1 bay: ${safe(String(bay.totalVehicles||0))} kend · ${num(bay.meanDwellSec||0)} dtk`,'slate'):''}
  </div>
  <div class="form-actions" style="margin-bottom:14px">${button(`${icon('sparkles')} Perbarui Decision Brief`,'ai-decision-brief','primary')}</div>
  <div class="cards three" style="margin-bottom:14px">
    <div class="card" style="min-width:0;overflow-wrap:anywhere"><strong>Contradictions &amp; Gaps (${gaps.length})</strong>${gaps.length?`<ul style="padding-left:18px;margin:8px 0 0">${gaps.map(g=>`<li style="margin-bottom:8px"><strong>${safe(g.code)}</strong> · ${safe(g.zone)} / ${safe(g.period)} <small>(${safe(g.evidenceLabel)})</small><br><small>${safe(g.reason)}</small></li>`).join('')}</ul>`:'<p class="muted">Tidak ada celah atau kontradiksi kritis pada jendela saat ini.</p>'}</div>
    <div class="card" style="min-width:0;overflow-wrap:anywhere"><strong>Scenario Hypotheses (${hyps.length})</strong>${hyps.length?`<ul style="padding-left:18px;margin:8px 0 0">${hyps.map(h=>`<li style="margin-bottom:10px"><strong>${safe(h.scenario)} · ${safe(h.title)}</strong><div><small>${safe(h.label||'synthetic_hypothesis_uncalibrated')}</small></div><p style="margin:4px 0">${safe(h.rationale)}</p><div><small>${formatParamsSummary(h.params)}</small></div><div style="margin-top:6px"><button type="button" class="btn" data-action="load-brief-scenario" data-scenario="${safe(h.scenario)}">Muat ${safe(h.scenario)} ke Simulator Heuristik</button></div></li>`).join('')}</ul>`:'<p class="muted">Belum ada hipotesis skenario.</p>'}</div>
    <div class="card" style="min-width:0;overflow-wrap:anywhere"><strong>Inspection Checklist (${checks.length})</strong>${checks.length?`<ol style="padding-left:18px;margin:8px 0 0">${checks.map(c=>`<li style="margin-bottom:8px"><strong>${safe(c.question)}</strong><br><small>${safe(c.zone)} · ${safe(c.period)} · ${safe(c.evidenceLabel)}</small></li>`).join('')}</ol>`:'<p class="muted">Belum ada daftar periksa.</p>'}</div>
  </div>
  <details><summary>Execution Trace (${safe(trace.runId||'local-deterministic')})</summary>
    <ul style="margin-top:8px">
      <li>Prompt: <code>${safe(trace.promptVersion||'decision-brief-v1')}</code> · Validator passed: <strong>${trace.validatorPassed?'true':'false'}</strong></li>
      <li>Pre-flight flags: ${(trace.preflightFlags||[]).length?trace.preflightFlags.map(f=>safe(f)).join(', '):'none'}</li>
      <li>Clamped fields: ${(trace.clampedFields||[]).length?trace.clampedFields.map(f=>safe(f)).join(', '):'none'}</li>
      <li>PDF context records: ${safe(String(pdf.totalRecords||0))} (${pdf.available?'indexed':'unavailable'})</li>
      <li>Providers: gemini=${safe(prov.gemini||'unavailable')} · pdf=${safe(prov.pdf||'unavailable')} · weather=${safe(prov.weather||'unavailable')} · traffic=${safe(prov.traffic||'unavailable')}</li>
    </ul>
  </details></section>`;
}
export function renderInsights(){const s=getState(),o=observationStats(s.observations),r=s.lastAnalysis||heuristicSimulation(s.scenario),best=rankScenarios(r)[0];const demoOnly=o.real===0;return `${pageHead('INSIGHT / DECISION SUPPORT','Temuan & Keputusan','Audit sumber bukti dan alur dari observasi sampai rekomendasi sebelum tindakan fisik.',`${button(`${icon('download')} Ekspor laporan`,'export-report','primary')}`)}
${note('<strong>Validasi diperlukan:</strong> temuan di bawah merupakan agregasi dari rekaman browser, bukan hasil Gemini yang tervalidasi. Keputusan pengaturan lalu lintas harus dikaji dan disetujui pihak berwenang.')}
<div class="cards three" style="margin-bottom:17px"><div class="card"><div class="stat-label">REKAMAN YANG DITINJAU</div><div class="stat-value">${o.count}</div><div class="stat-foot">${o.real} manual; ${o.synthetic} sintetis</div></div><div class="card"><div class="stat-label">DURASI BERHENTI RATA-RATA</div><div class="stat-value">${num(o.avgDwell)} <span style="font-size:11px">detik</span></div><div class="stat-foot">Agregasi aritmetis dari catatan tersedia</div></div><div class="card"><div class="stat-label">STATUS EVIDENCE</div><div class="stat-value" style="font-size:19px;margin-top:14px">Belum tervalidasi</div><div class="stat-foot">Observasi terpisah dan kalibrasi diperlukan</div></div></div>
${renderDecisionBriefCard(s)}
<div class="two-cols"><section class="card">${cardHeading('Ringkasan temuan','Temuan deterministik dari data yang tersimpan',tag(demoOnly?'HANYA SINTETIS':'CAMPURAN','gold'))}<ul class="list-clean"><li><div class="li-ico">${icon('car',16)}</div><div><strong>${o.pickup} kejadian penjemputan</strong><p>Jumlah berasal dari kategori Jemput yang tercatat. Belum dapat digeneralisasi ke volume lalu lintas total.</p></div></li><li><div class="li-ico">${icon('clock',16)}</div><div><strong>${o.waiting} kejadian menunggu</strong><p>Definisi menunggu mengikuti pilihan petugas saat input, bukan klasifikasi video otomatis.</p></div></li><li><div class="li-ico">${icon('map-pin',16)}</div><div><strong>${o.zoneCount} zona memiliki catatan</strong><p>Distribusi zona perlu dibandingkan dengan durasi sesi yang setara.</p></div></li></ul><div class="callout warning" style="margin-top:13px"><strong>AI Gemini melalui backend</strong>Analisis hanya menggunakan agregat kejadian manual (tanpa catatan bebas, foto, atau identitas). Perlu kunci GEMINI_API_KEY di server. Hasil AI adalah interpretasi yang belum diverifikasi.<div class="form-actions">${button(`${icon('sparkles')} Analisis dengan Gemini`,'ai-insights','primary')}</div></div>${s.aiInsights?`<div class="api-ai-result"><h3>Gemini / Hasil belum tervalidasi</h3><p>${safe(s.aiInsights.result.summary)}</p>${[['Temuan',s.aiInsights.result.findings],['Keterbatasan',s.aiInsights.result.limitations],['Langkah lanjut',s.aiInsights.result.nextSteps]].map(([name,items])=>`<strong>${name}</strong><ul>${items.map(x=>`<li>${safe(x)}</li>`).join('')}</ul>`).join('')}<small>${safe(s.aiInsights.model)} - ${s.aiInsights.sourceEvents} kejadian manual - memerlukan review manusia</small></div>`:''}</section>
<section class="card">${cardHeading('Rantai keterlacakan','Klik modul terkait untuk meninjau setiap tahapan.')}${[['Data observasi',`${o.count} catatan; ${o.real} manual`, 'goto-monitor','database'],['Asumsi model',`${Object.keys(s.scenario).length} parameter tersimpan`,'goto-simulation','sliders-horizontal'],['Keluaran skenario',`${r.engine==='sumo'?'SUMO demo':'Estimasi heuristik'}; 3 alternatif`,'goto-simulation','git-compare-arrows'],['Interpretasi awal',`${best.id} skor terendah, tidak mengikat`,'goto-simulation','target'],['Laporan','Unduh bukti dan keterbatasan','goto-reports','files']].map((x,i)=>`<button data-action="${x[2]}" class="btn" style="width:100%;border:0;border-bottom:1px solid #edf1f4;border-radius:0;padding:15px 4px;display:flex;justify-content:space-between;text-align:left"><span style="display:flex;align-items:center;gap:11px"><span style="color:#0a4f87">${icon(x[3],19)}</span><span><strong style="display:block;color:#324962">${i+1}. ${x[0]}</strong><small style="font-size:9px;color:#8796a4;font-weight:500">${x[1]}</small></span></span>${icon('chevron-right',15)}</button>`).join('')}</section></div>
<div class="section-h"><h2>Kriteria penerimaan proposal</h2></div><section class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Objektif</th><th>Target</th><th>Metode pengujian</th><th>Status</th></tr></thead><tbody>${[['Deteksi kejadian','F1-score ≥ 0,80','Bandingkan dengan anotasi manusia'],['Estimasi volume','Galat ≤ 20%','Validasi pada sesi terpisah'],['Evaluasi alternatif','A0, A1, A2','Pengulangan SUMO dan sensitivitas'],['Akses pejalan kaki','Jarak dan trade-off','Audit aksesibilitas'],['Audit keputusan','Asumsi dan sumber tercatat','Pengujian data dan log']].map(x=>`<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td><td>${tag('BELUM DIUJI','gold')}</td></tr>`).join('')}</tbody></table></div><p class="footnote">Objektif diambil dari proposal SIMPUL halaman 3. Status tidak akan berubah menjadi "lulus" hanya karena demo berjalan.</p></section>`}
