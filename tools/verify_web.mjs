/** Verify exact frontend payload, JavaScript syntax, dependencies and offline cache. */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
async function list(dir) {
  const result=[];
  for(const item of await readdir(dir,{withFileTypes:true})) {
    const target=path.join(dir,item.name);
    if(item.isDirectory()) result.push(...await list(target));
    else if(item.isFile()) result.push(target);
  }
  return result.sort();
}
const expected=['index.html','styles.css','manifest.webmanifest','sw.js'];
for(const dir of ['js','assets']) for(const file of await list(path.join(root,dir))) expected.push(path.relative(root,file).split(path.sep).join('/'));
const actual=(await list(out)).map(file=>path.relative(out,file).split(path.sep).join('/'));
const extra=actual.filter(file=>file!=='build-manifest.json'&&!expected.includes(file));
if(extra.length) throw new Error('Unexpected stale output files: '+extra.join(', '));
const entries=[];
let jsCount=0,importCount=0;
const sw=await readFile(path.join(out,'sw.js'),'utf8');
const cache=JSON.parse(sw.match(/const ASSETS=(\[.*?\]);/s)?.[1]||'null');
if(!cache) throw new Error('Offline cache declaration missing');
for(const relative of expected) {
  const source=await readFile(path.join(root,relative));
  const payload=await readFile(path.join(out,relative));
  if(relative!=='sw.js'&&!source.equals(payload)) throw new Error('Output differs from source: '+relative);
  const text=payload.toString('utf8');
  if(relative.endsWith('.js')) {
    jsCount++;
    const checked=spawnSync(process.execPath,['--check',path.join(out,relative)],{encoding:'utf8'});
    if(checked.status!==0) throw new Error('Invalid JavaScript '+relative+': '+checked.stderr);
    if(relative.startsWith('js/')&&!cache.includes('./'+relative)) throw new Error('Offline JS missing: '+relative);
    for(const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"]+)['"]/g)) {
      if(!match[1].startsWith('.')) continue;
      const target=path.resolve(out,path.dirname(relative),match[1]);
      if(!target.startsWith(out+path.sep)) throw new Error('Import escapes output: '+relative);
      await readFile(target);
      importCount++;
    }
  }
  entries.push({path:relative,bytes:payload.length,sha256:createHash('sha256').update(payload).digest('hex')});
}
for(const asset of cache) {
  if(asset==='./') continue;
  await readFile(path.join(out,asset));
}
const report={project:'SIMPUL',javascriptFiles:jsCount,localImports:importCount,files:entries};
await writeFile(path.join(out,'build-manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(`PASS payload audit: ${expected.length} exact files, ${jsCount} JavaScript syntax checks, ${importCount} imports, ${cache.length} offline entries`);
