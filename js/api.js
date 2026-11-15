let tokenFallback = '';
export function getSessionApiToken(){ try { return sessionStorage.getItem('simpul_api_token') || tokenFallback; } catch { return tokenFallback; } }
export function setSessionApiToken(token){ tokenFallback=token; try { if(token) sessionStorage.setItem('simpul_api_token',token); else sessionStorage.removeItem('simpul_api_token'); } catch { /* opaque-origin demo; memory-only token */ } }
/** Same-origin REST adapter: deliberately refuses remote calls from a file:// bundle. */
export async function apiRequest(path,{method='GET',body,timeout=25000}={}){
  if(location.protocol==='file:')throw new Error('API memerlukan server. Jalankan python server/app.py lalu buka http://localhost:8888 (bukan file HTML).');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  // Optional local/shared-workspace protection. Never put API credentials in project backups.
  const token=getSessionApiToken();
  try{
    const res=await fetch(path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{'Authorization':'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});
    const response=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(typeof response.detail==='string'?response.detail:`API mengembalikan HTTP ${res.status}.`);
    return response;
  }catch(e){if(e.name==='AbortError')throw new Error('Permintaan API melewati batas waktu.');if(e instanceof TypeError)throw new Error('Backend belum tersambung atau jaringan terputus.');throw e;}
  finally{clearTimeout(timer)}
}
