import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const bundle=readFileSync('docs/bundled_app.js','utf8');
let html='';
const storage=new Map();
const context=vm.createContext({console,Date,Intl,Math,URL,URLSearchParams,AbortController,Blob,
 location:{hash:'#publicintel',protocol:'file:'},navigator:{},
 document:{hidden:false,querySelector(){return null},getElementById(id){return id==='app'?{set innerHTML(v){html=v},get innerHTML(){return html}}:null},addEventListener(){}},
 window:{addEventListener(){},scrollTo(){}},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 requestAnimationFrame(){return 1},
 setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){}
});
vm.runInContext(bundle,context,{timeout:5000});
assert.match(html,/Konteks Publik & OpenOSINT/);
assert.match(html,/No identity lookup/);
assert.match(html,/osint-search/);
assert.match(html,/Belum ada hasil konteks/);
assert.match(html,/lokasi kejadian/);
assert.equal(vm.runInContext('getState().osintLookup',context),null);
console.log('OpenOSINT offline UI render passed; no fabricated results');
