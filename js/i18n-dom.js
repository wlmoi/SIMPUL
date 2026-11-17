/**
 * Whole-page language layer. Views and controllers write text in either Indonesian
 * or English; after every DOM change this module rewrites text nodes and a few
 * accessible attributes into the active language using the phrase pairs in
 * js/i18n-phrases.js. Numbers inside a sentence are matched with '#' and carried over.
 * Presentation only: it never touches the store, exports or anything sent to a server.
 * Opt out for a subtree with `data-no-i18n`.
 */
import {getLanguage} from './i18n.js';
import {I18N_PHRASES} from './i18n-phrases.js';

const I18N_NUM=/\d+(?:[.,]\d+)*/g;
const I18N_ATTRS=['placeholder','title','aria-label','alt'];
const I18N_SKIP='script,style,code,pre,textarea,[data-no-i18n],[contenteditable="true"]';
const i18nMaps={en:new Map(),id:new Map()};
for(const [idText,enText] of I18N_PHRASES){
  if(!i18nMaps.en.has(idText))i18nMaps.en.set(idText,enText);
  if(!i18nMaps.id.has(enText))i18nMaps.id.set(enText,idText);
}
// Last value this module wrote per node/attribute, so a translated phrase is never re-translated in a chain.
const i18nWritten=new WeakMap();
let i18nObserver=null;

/** Translate one string into `lang`; returns the input unchanged when no phrase matches. */
export function translatePhrase(text,lang=getLanguage()){
  if(typeof text!=='string'||!/[A-Za-z]/.test(text))return text;
  const map=i18nMaps[lang];if(!map)return text;
  const core=text.replace(/\s+/g,' ').trim();if(!core)return text;
  let out=map.get(core);
  if(out===undefined){
    const nums=core.match(I18N_NUM);if(!nums)return text;
    const target=map.get(core.replace(I18N_NUM,'#'));if(target===undefined)return text;
    let i=0;out=target.replace(/#/g,()=>nums[Math.min(i++,nums.length-1)]);
  }
  if(out===core)return text;
  const lead=text.match(/^\s*/)[0],trail=text.match(/\s*$/)[0];
  return lead+out+trail;
}

function i18nText(node,lang){
  const parent=node.parentElement;if(!parent||parent.closest(I18N_SKIP))return;
  const value=node.nodeValue;
  const record=i18nWritten.get(node);
  if(record&&record.value===value&&record.lang===lang)return;
  const next=translatePhrase(value,lang);
  if(next!==value){node.nodeValue=next;i18nWritten.set(node,{value:next,lang});}
}
function i18nElement(el,lang){
  if(el.closest(I18N_SKIP))return;
  for(const name of I18N_ATTRS){
    const value=el.getAttribute(name);if(!value)continue;
    const key=`${name}\u0000${value}`;const done=i18nWritten.get(el);
    if(done?.[key]===lang)continue;
    const next=translatePhrase(value,lang);
    if(next!==value){el.setAttribute(name,next);i18nWritten.set(el,{...(done||{}),[`${name}\u0000${next}`]:lang});}
  }
}

/** Translate every text node and supported attribute under `root`. */
export function translateTree(root=document.body,lang=getLanguage()){
  if(!root)return;
  if(root.nodeType===3){i18nText(root,lang);return;}
  if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode()))i18nText(node,lang);
  if(root.nodeType===1)i18nElement(root,lang);
  root.querySelectorAll?.('[placeholder],[title],[aria-label],[alt]').forEach(el=>i18nElement(el,lang));
}

/** Keep the whole document in the active language, including content added later. */
export function installDomI18n(){
  if(typeof window==='undefined'||typeof document==='undefined'||typeof MutationObserver==='undefined'||!document.body?.querySelectorAll)return;
  if(i18nObserver)return;
  document.documentElement.lang=getLanguage();
  translateTree(document.body);
  i18nObserver=new MutationObserver(records=>{
    const lang=getLanguage();
    if(document.documentElement.lang!==lang)document.documentElement.lang=lang;
    for(const r of records){
      if(r.type==='characterData')i18nText(r.target,lang);
      else if(r.type==='attributes')i18nElement(r.target,lang);
      else r.addedNodes.forEach(n=>translateTree(n,lang));
    }
  });
  i18nObserver.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:I18N_ATTRS});
}

/** Re-run after a language switch that does not re-render everything. */
export function refreshDomI18n(){
  if(typeof document==='undefined'||!document.body)return;
  document.documentElement.lang=getLanguage();
  translateTree(document.body);
}
