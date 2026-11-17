/**
 * Themed form controls: rounded dropdowns and range sliders with a filled track.
 * Dropdowns: Progressive enhancement over native <select>:
 * the native element stays in the DOM (visually hidden) and remains the source of
 * truth, so existing `change` handlers, forms and tests keep working.
 * Opt out per element with `data-native`. Presentation only; never touches the store.
 */
const CS_CHEVRON='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const CS_CHECK='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
let csOpen=null,csSeq=0,csTypeBuf='',csTypeTimer=0;

const csLabel=select=>select.selectedOptions?.[0]?.textContent?.trim()||select.options[0]?.textContent?.trim()||'';
const csEnabled=select=>[...select.options].filter(o=>!o.disabled&&!o.hidden);

function csSync(select){
  const trigger=select._csTrigger;if(!trigger)return;
  // Write only on change: the document MutationObserver would otherwise re-trigger this forever.
  const value=trigger.querySelector('.cs-value'),label=csLabel(select);
  if(value.textContent!==label)value.textContent=label;
  if(trigger.disabled!==select.disabled)trigger.disabled=select.disabled;
  if(trigger.title!==label)trigger.title=label;
}

function csPlace(){
  if(!csOpen)return;
  const {trigger,list}=csOpen,r=trigger.getBoundingClientRect(),gap=6;
  const below=window.innerHeight-r.bottom-gap-8,above=r.top-gap-8;
  const up=below<180&&above>below;
  list.style.minWidth=`${Math.max(r.width,160)}px`;
  list.style.maxHeight=`${Math.max(120,Math.min(320,up?above:below))}px`;
  const width=list.offsetWidth;
  list.style.left=`${Math.max(8,Math.min(r.left,window.innerWidth-width-8))}px`;
  list.style.top=up?'':`${r.bottom+gap}px`;
  list.style.bottom=up?`${window.innerHeight-r.top+gap}px`:'';
  list.dataset.side=up?'top':'bottom';
}

function csActivate(item){
  if(!csOpen||!item)return;
  csOpen.list.querySelectorAll('.cs-option.is-active').forEach(o=>o.classList.remove('is-active'));
  item.classList.add('is-active');csOpen.trigger.setAttribute('aria-activedescendant',item.id);
  item.scrollIntoView({block:'nearest'});
}

function csClose(focus=true){
  if(!csOpen)return;
  const {trigger,list}=csOpen;csOpen=null;
  trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');
  trigger.closest('.cs-wrap')?.classList.remove('is-open');
  list.remove();
  if(focus)trigger.focus({preventScroll:true});
}

function csChoose(select,value){
  if(select.value!==value){
    select.value=value;
    select.dispatchEvent(new Event('input',{bubbles:true}));
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  csSync(select);csClose();
}

function csOpenList(select){
  if(select.disabled)return;
  csClose(false);
  const trigger=select._csTrigger,list=document.createElement('ul');
  list.className='cs-list';list.id=`${trigger.id}-list`;list.setAttribute('role','listbox');
  list.setAttribute('aria-label',trigger.getAttribute('aria-label')||csLabel(select));
  [...select.options].forEach((o,i)=>{
    if(o.hidden)return;
    const li=document.createElement('li');
    li.className='cs-option';li.id=`${trigger.id}-opt-${i}`;li.setAttribute('role','option');li.dataset.value=o.value;
    const selected=o.selected;li.setAttribute('aria-selected',String(selected));
    if(o.disabled){li.setAttribute('aria-disabled','true');li.classList.add('is-disabled');}
    li.innerHTML=`<span class="cs-check">${selected?CS_CHECK:''}</span><span></span>`;
    li.lastChild.textContent=o.textContent.trim();
    list.append(li);
  });
  list.addEventListener('pointerdown',e=>e.preventDefault());
  list.addEventListener('click',e=>{const li=e.target.closest('.cs-option');if(li&&!li.classList.contains('is-disabled'))csChoose(select,li.dataset.value);});
  list.addEventListener('pointermove',e=>{const li=e.target.closest('.cs-option');if(li&&!li.classList.contains('is-active')&&!li.classList.contains('is-disabled'))csActivate(li);});
  const dark=trigger.closest('.cctv-page,.mc-hero,[data-theme="dark"]');if(dark)list.classList.add('cs-dark');
  document.body.append(list);
  csOpen={select,trigger,list};
  trigger.setAttribute('aria-expanded','true');trigger.setAttribute('aria-controls',list.id);
  trigger.closest('.cs-wrap')?.classList.add('is-open');
  csPlace();
  csActivate(list.querySelector('.cs-option[aria-selected="true"]')||list.querySelector('.cs-option:not(.is-disabled)'));
}

function csMove(step){
  if(!csOpen)return;
  const items=[...csOpen.list.querySelectorAll('.cs-option:not(.is-disabled)')];if(!items.length)return;
  const at=items.findIndex(li=>li.classList.contains('is-active'));
  const next=step==='first'?0:step==='last'?items.length-1:Math.min(items.length-1,Math.max(0,at+step));
  csActivate(items[next]);
}

function csTypeahead(select,key){
  clearTimeout(csTypeTimer);csTypeBuf+=key.toLowerCase();csTypeTimer=setTimeout(()=>{csTypeBuf='';},600);
  const match=csEnabled(select).find(o=>o.textContent.trim().toLowerCase().startsWith(csTypeBuf));
  if(!match)return;
  if(csOpen)csActivate([...csOpen.list.children].find(li=>li.dataset.value===match.value));
  else csChoose(select,match.value);
}

function csKeydown(e,select){
  const open=csOpen?.select===select;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    if(!open){csOpenList(select);return;}
    csMove(e.key==='ArrowDown'?1:-1);
  }else if(e.key==='Home'||e.key==='End'){if(open){e.preventDefault();csMove(e.key==='Home'?'first':'last');}}
  else if(e.key==='PageDown'||e.key==='PageUp'){if(open){e.preventDefault();csMove(e.key==='PageDown'?5:-5);}}
  else if(e.key==='Enter'||e.key===' '){
    if(e.key===' '&&csTypeBuf)return csTypeahead(select,' ');
    e.preventDefault();
    if(!open)csOpenList(select);
    else{const li=csOpen.list.querySelector('.cs-option.is-active');if(li)csChoose(select,li.dataset.value);else csClose();}
  }else if(e.key==='Escape'){if(open){e.preventDefault();e.stopPropagation();csClose();}}
  else if(e.key==='Tab'){if(open){const li=csOpen.list.querySelector('.cs-option.is-active');if(li)csChoose(select,li.dataset.value);csClose(false);}}
  else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){csTypeahead(select,e.key);}
}

function csEnhance(select){
  if(select._csTrigger||select.multiple||select.size>1||select.hasAttribute('data-native'))return;
  const wrap=document.createElement('span');
  wrap.className='cs-wrap';
  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.id=`cs-${select.id||'field'}-${++csSeq}`;
  // Keep the original classes so existing layout rules (.control, .monitor-select …) still size it.
  trigger.className=`${select.className} cs-trigger`.trim();
  trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
  const labelText=select.getAttribute('aria-label')||select.closest('label')?.firstChild?.textContent?.trim()||(select.id&&document.querySelector(`label[for="${CSS.escape(select.id)}"]`)?.textContent?.trim());
  if(labelText)trigger.setAttribute('aria-label',labelText);
  if(select.title)trigger.title=select.title;
  trigger.innerHTML=`<span class="cs-value"></span><span class="cs-chevron">${CS_CHEVRON}</span>`;
  select.classList.add('cs-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  select.before(wrap);wrap.append(select,trigger);
  select._csTrigger=trigger;
  trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(csOpen?.select===select)csClose();else csOpenList(select);});
  trigger.addEventListener('keydown',e=>csKeydown(e,select));
  trigger.addEventListener('blur',()=>{setTimeout(()=>{if(csOpen?.select===select&&document.activeElement!==trigger)csClose(false);},0);});
  select.addEventListener('change',()=>csSync(select));
  // A <label> click focuses the hidden select; redirect it to the visible trigger.
  select.addEventListener('focus',()=>trigger.focus({preventScroll:true}));
  csSync(select);
}

/** Range sliders: expose the filled share as --fill so CSS can paint the track up to the knob. */
export function rangeFill(input){
  const min=Number(input.min||0),max=Number(input.max||100),v=Number(input.value);
  const p=max>min?Math.min(1,Math.max(0,(v-min)/(max-min))):0;
  const fill=`calc(12px + (100% - 24px) * ${p.toFixed(4)})`;
  if(input.style.getPropertyValue('--fill')!==fill)input.style.setProperty('--fill',fill);
}
function csRanges(root){root.querySelectorAll?.('input[type=range]').forEach(rangeFill);}

/** Enhance every native <select> under `root`. Safe to call repeatedly. */
export function enhanceSelects(root=document){
  root.querySelectorAll?.('select:not(.cs-native)').forEach(csEnhance);
  root.querySelectorAll?.('select.cs-native').forEach(csSync);
}

/** Watch the document so selects in re-rendered pages and modals are enhanced automatically. */
export function installCustomSelects(){
  // Progressive enhancement: skip silently in minimal DOMs (render tests, very old browsers).
  if(typeof window==='undefined'||typeof document==='undefined'||typeof MutationObserver==='undefined'||!document.body?.querySelectorAll)return;
  if(window.__csInstalled)return;window.__csInstalled=true;
  enhanceSelects(document);
  let queued=false;
  new MutationObserver(()=>{
    if(queued)return;queued=true;
    queueMicrotask(()=>{queued=false;if(csOpen&&!csOpen.trigger.isConnected)csClose(false);enhanceSelects(document);csRanges(document);});
  }).observe(document.body,{childList:true,subtree:true});
  csRanges(document);
  document.addEventListener('input',e=>{if(e.target?.matches?.('input[type=range]'))rangeFill(e.target);},true);
  document.addEventListener('pointerdown',e=>{if(csOpen&&!csOpen.list.contains(e.target)&&!csOpen.trigger.contains(e.target))csClose(false);},true);
  window.addEventListener('resize',()=>csPlace());
  window.addEventListener('scroll',e=>{if(csOpen&&!csOpen.list.contains(e.target))csPlace();},true);
}
