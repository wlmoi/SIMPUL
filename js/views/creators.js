/** Credits are grounded in the submitted SIMPUL proposal. Only the supplied LinkedIn profile is linked. */
import {icon,safe} from '../util.js';
import {pageHead,tag} from './shared.js';
export const SIMPUL_TEAM=Object.freeze([
 {name:'William Anthony',role:'Ketua Tim',area:'Arsitektur sistem dan integrasi',link:'https://www.linkedin.com/in/wlmoi/'},
 {name:'Gregorius Yoga Robianto',role:'Full-Stack Engineer',area:'Aplikasi dan pipeline data'},
 {name:'Bennaya Jonathan R. P. Siagian',role:'User Research',area:'Riset pengguna dan pitching'},
 {name:'Brian Albar Hadian',role:'Verification',area:'Verifikasi dan kualitas sistem'},
 {name:'Karol Yangqian Poetracahya',role:'Traffic Simulation',area:'Sistem informasi dan simulasi lalu lintas'}
]);
export function renderCreators(){return `${pageHead('ISEEDESIGNITB / THE TEAM','About the Creators','Tim mahasiswa Institut Teknologi Bandung yang mengembangkan konsep dan prototipe SIMPUL berdasarkan proposal SI Bridges Indonesia 2026.')}
<section class="creators-intro"><div><span class="creators-kicker">BEHIND SIMPUL</span><h2>Designed for better decisions around urban transit.</h2><p>Fokus tim adalah evaluasi penjemputan MRT Fatmawati melalui observasi, analisis, simulasi, dan keputusan yang transparan. Keterangan peran diambil dari proposal tim, bukan klaim riwayat profesional pribadi.</p></div><div class="creators-monogram" aria-hidden="true">iSee<span>Design</span><strong>ITB</strong></div></section>
<div class="section-h"><h2>Tim pengembang</h2><small>5 mahasiswa ITB</small></div>
<section class="creators-grid">${SIMPUL_TEAM.map((person,index)=>`<article class="creator-card"><span class="creator-index">${String(index+1).padStart(2,'0')}</span><div class="creator-initials" aria-hidden="true">${safe(person.name.split(' ').slice(0,2).map(x=>x[0]).join(''))}</div><h3>${safe(person.name)}</h3><span class="creator-role">${safe(person.role)}</span><p>${safe(person.area)}</p>${person.link?`<a class="creator-social" href="${person.link}" target="_blank" rel="noopener noreferrer" aria-label="Buka LinkedIn William Anthony">${icon('linkedin',16)} LinkedIn ${icon('arrow-up-right',14)}</a>`:'<span class="creator-no-link">Profil publik tidak dicantumkan</span>'}</article>`).join('')}</section>
<section class="creators-outro"><div><span class="creators-kicker">PROJECT ORIGIN</span><h3>SI Bridges Indonesia 2026</h3><p>Inisiatif riset transportasi, satu masalah pada satu lokasi. Profil tim dan tanggung jawab mengacu pada proposal SIMPUL. Hasil simulasi yang belum dikalibrasi tidak ditampilkan sebagai bukti dampak nyata.</p></div><button class="btn primary" data-route="overview" type="button">${icon('arrow-left',16)} Kembali ke solusi</button></section>`}
