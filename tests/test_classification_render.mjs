import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const bundle=readFileSync('docs/bundled_app.js','utf8');
const mounted={innerHTML:''};
const handlers={};
const data=new Map();
const context=vm.createContext({
 console,Date,Intl,Math,URL,URLSearchParams,AbortController,Blob,
 location:{hash:'#vehicles',protocol:'file:'},
 navigator:{},
 document:{hidden:false,querySelector(){return null},getElementById(id){if(id==='app')return mounted;return null},
 addEventListener(name,fn){handlers[name]=fn}},
 window:{addEventListener() {},scrollTo() {}},
 localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},
 requestAnimationFrame(){return 1},
 setTimeout(fn){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},
 });
vm.runInContext(bundle,context,{filename:'SIMPUL_Standalone_bundle.js',timeout:5000});
// The manual classification page was removed; the bundle renders the vehicle problem page without a browser.
assert.match(mounted.innerHTML,/Masalah Kendaraan di Titik Jemput/);
assert.match(mounted.innerHTML,/Buka CCTV AI/);
assert.doesNotMatch(mounted.innerHTML,/data-route="classification"/);
console.log('Standalone render smoke passed');
