import { initialData } from './data.js';
const KEY = 'simpul_workspace_v2';
function sanitize(saved) {
 const initial=initialData();
 if (!saved || saved.version!==initial.version) return initial;
 const {edgeBenchmark,edgeData,...clean}=saved;
 return {...initial,...clean,
   project:{...initial.project,...saved.project},
   scenario:{...initial.scenario,...saved.scenario},
   finance:{...initial.finance,...saved.finance},
   equipmentPrices:Object.fromEntries(Object.keys(initial.equipmentPrices).map(k=>[k,Number(saved.equipmentPrices?.[k]??initial.equipmentPrices[k])])),
   equipmentMode:['phone','cloud','edge'].includes(saved.equipmentMode)?saved.equipmentMode:'phone',
   context:{...initial.context,...saved.context},
   contextPlus:{...initial.contextPlus,...saved.contextPlus},
   osintLookup: saved.osintLookup && typeof saved.osintLookup==='object'? {...saved.osintLookup,items:Array.isArray(saved.osintLookup.items)?saved.osintLookup.items.slice(0,15):[]} :null,
   monitorFilter:{...initial.monitorFilter,...saved.monitorFilter},
   activityLog:Array.isArray(saved.activityLog)?saved.activityLog.slice(-500):[],
   eventReviews:saved.eventReviews && typeof saved.eventReviews==='object' && !Array.isArray(saved.eventReviews)?saved.eventReviews:{},
   classificationAudit:Array.isArray(saved.classificationAudit)?saved.classificationAudit.slice(-1000):[],
   policeFilter:{...initial.policeFilter,...saved.policeFilter},
   vehicleView:{...initial.vehicleView,...saved.vehicleView},
   fieldReadings:Array.isArray(saved.fieldReadings)?saved.fieldReadings.filter(x=>x&&x.source==='manual').slice(-3000):[],
   fieldSettings:{...initial.fieldSettings,...saved.fieldSettings},
   surveyProtocol:{...initial.surveyProtocol,...saved.surveyProtocol},
   sessionReviews:saved.sessionReviews&&typeof saved.sessionReviews==='object'&&!Array.isArray(saved.sessionReviews)?saved.sessionReviews:{},
   responseCases:Array.isArray(saved.responseCases)?saved.responseCases.filter(x=>x&&typeof x==='object').slice(-1000):[],
   responseAudit:Array.isArray(saved.responseAudit)?saved.responseAudit.slice(-2500):[],
   decisions:Array.isArray(saved.decisions)?saved.decisions.slice(-100):[],
   comparisonScenario:['A0','A1','A2'].includes(saved.comparisonScenario)?saved.comparisonScenario:'A1',
   monitorRemote:saved.monitorRemote??null,
   pdfEvidence:{...initial.pdfEvidence,...(saved.pdfEvidence||{}),items:Array.isArray(saved.pdfEvidence?.items)?saved.pdfEvidence.items.filter(x=>x?.source==='uploaded_pdf').slice(-200):[]},
   zonePins:saved.zonePins&&typeof saved.zonePins==='object'&&!Array.isArray(saved.zonePins)?saved.zonePins:{},
   monitorAutoSync:saved.monitorAutoSync===true
 };
}
export function readState(){try{return sanitize(JSON.parse(localStorage.getItem(KEY)));}catch{return initialData();}}
let state=readState();
let listeners=[];
export function getState(){return state;}
export function updateState(updater){state=sanitize(updater(state));try{localStorage.setItem(KEY,JSON.stringify(state));}catch(error){console.warn('Storage write failed',error);}listeners.forEach(f=>f(state));return state;}
export function subscribe(fn){listeners.push(fn);return ()=>listeners=listeners.filter(x=>x!==fn);}
export function resetState(){state=initialData();localStorage.setItem(KEY,JSON.stringify(state));listeners.forEach(f=>f(state));}
export function exportState(){return JSON.stringify({exportedAt:new Date().toISOString(),type:'SIMPUL workspace backup',data:state},null,2)}
export function importState(raw){let p=JSON.parse(raw),d=p.data??p;if(d.version!==2||!Array.isArray(d.observations)||!Array.isArray(d.pipeline))throw new Error('Format cadangan tidak sesuai.');updateState(()=>d);}
