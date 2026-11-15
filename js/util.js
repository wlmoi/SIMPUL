export const rupiah=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0);
export const compact=n=>new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(Number(n)||0);
export const num=n=>new Intl.NumberFormat('id-ID',{maximumFractionDigits:1}).format(Number(n)||0);
export const pct=n=>(Number(n)||0).toFixed(1).replace('.',',')+'%';
export const shortDate=s=>new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s));
export const clock=s=>new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Jakarta'}).format(new Date(s));
export const safe=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const clamp=(x,min,max)=>Math.min(max,Math.max(min,Number(x)||0));
export const uid=(prefix='id')=>`${prefix}-${Math.random().toString(36).slice(2,10)}`;
export function download(name,content,mime='application/json'){const blob=new Blob([content],{type:mime});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),3000)}
export const nowIso=()=>new Date().toISOString();
export const isDemo=s=>s?.source==='demo';
export function icon(name,size=20){
const paths={
 'cpu':'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 1v4m6-4v4M9 19v4m6-4v4M19 9h4m-4 6h4M1 9h4m-4 6h4"/>',
 'plug-zap':'<path d="M12 3v7l-3 2 4 1-2 8 6-11-4-1 1-6M5 5l3 3m11-3-3 3"/>',
 'clipboard-list':'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4a3 3 0 0 1 6 0M9 10h6M9 14h6M9 18h4"/>',
 'layout-dashboard':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 'scan-line':'<path d="M4 7V5a2 2 0 0 1 2-2h3M15 3h3a2 2 0 0 1 2 2v2M20 17v2a2 2 0 0 1-2 2h-3M9 21H6a2 2 0 0 1-2-2v-2M4 12h16"/>',
 'git-compare-arrows':'<path d="M3 6h17M20 6l-3-3M20 6l-3 3M21 18H4m0 0 3-3m-3 3 3 3"/>',
 'brain-circuit':'<path d="M12 18V5a3 3 0 0 0-6 0 3 3 0 0 0-2 5 4 4 0 0 0 0 7 3 3 0 0 0 5 3l3-2Zm0 0V5a3 3 0 0 1 6 0 3 3 0 0 1 2 5 4 4 0 0 1 0 7 3 3 0 0 1-5 3l-3-2Z"/>',
 'chart-no-axes-combined':'<path d="m3 17 6-6 4 4 8-8M17 7h4v4M3 3v18h18"/>',
 'users':'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 'smartphone':'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M11 18h2"/>',
 'map':'<path d="M3 5 9 3l6 3 6-2v15l-6 2-6-3-6 2V5ZM9 3v15m6-12v15"/>',
 'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h8"/>',
 'files':'<path d="M6 3h9l4 4v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M8 13h8M8 17h7"/>',
 'settings-2':'<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
 'arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
 'chevron-right':'<path d="m9 18 6-6-6-6"/>',
 'chevron-down':'<path d="m6 9 6 6 6-6"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'play':'<path d="m8 5 11 7-11 7V5Z"/>',
 'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'map-pin':'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 10h.01"/>',
 'shield-check':'<path d="M12 2 4 5v6c0 5.5 4 9 8 11 4-2 8-5.5 8-11V5l-8-3Zm-4 10 3 3 5-6"/>',
 'activity':'<path d="M2 12h4l3-7 5 14 3-7h5"/>',
 'car':'<path d="m5 11 2-6h10l2 6M4 11h16v7H4zm2 7v2m12-2v2M7 14h.01M17 14h.01"/>',
 'route':'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>',
 'target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 'check':'<path d="m5 12 4 4L19 6"/>',
 'alert-circle':'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
 'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
 'download':'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
 'refresh-cw':'<path d="M20 7v5h-5M4 17v-5h5M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/>',
 'more-horizontal':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 'menu':'<path d="M3 6h18M3 12h18M3 18h18"/>',
 'x':'<path d="M5 5 19 19M19 5 5 19"/>',
 'search':'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 'calculator':'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M7 6h10v4H7zm1 8h1m4 0h1m4 0h.01M8 18h1m4 0h1m4 0h.01"/>',
 'layers':'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
 'database':'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
 'cloud':'<path d="M20 17a4 4 0 0 0-1-7.87A7 7 0 0 0 5 10a4 4 0 0 0 0 8h13"/>',
 'external-link':'<path d="M13 5h6v6M19 5l-9 9M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/>',
 'trash-2':'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>',
 'filter':'<path d="M3 4h18l-7 8v8l-4-2v-6L3 4Z"/>',
 'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 'sliders-horizontal':'<path d="M4 7h16M4 17h16M9 4v6M15 14v6"/>',
 'file-check':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 15l3 3 5-6"/>',
 'wifi-off':'<path d="M2 2l20 20M8 9a11 11 0 0 1 9-1M4 12a17 17 0 0 1 6-3m4 4a6 6 0 0 1 4 2M12 20h.01"/>',
 'sparkles':'<path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6ZM20 17v5m-2-3h4"/>'};
return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.info}</svg>`;
}
