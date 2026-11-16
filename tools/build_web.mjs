import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await mkdir(output, { recursive: true });
// Only public frontend files are copied; backend, credentials and research stay private.
for (const entry of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js', 'js', 'assets']) {
  await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
}
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort();
}
const publicFiles = (await files(output)).filter(file => path.basename(file) !== 'build-manifest.json');
const digest = createHash('sha256');
for (const file of publicFiles) digest.update(await readFile(file));
const version = digest.digest('hex').slice(0, 16);
const sw = await readFile(path.join(output, 'sw.js'), 'utf8');
const offline = ['./', ...publicFiles
  .map(file => './' + path.relative(output, file).split(path.sep).join('/'))
  .filter(file => file.endsWith('.js') && file !== './sw.js' || /\.(?:html|css|webmanifest|svg|png|jpg|jpeg|webp|woff2?)$/.test(file))];
await writeFile(path.join(output, 'sw.js'), sw
  .replace(/const CACHE='[^']+';/, `const CACHE='simpul-web-${version}';`)
  .replace(/const ASSETS=\[.*?\];/s, 'const ASSETS=' + JSON.stringify(offline) + ';'));
// Check the complete local ES-module graph in the deployed output.
let imports = 0;
for (const file of publicFiles.filter(file => file.endsWith('.js'))) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) {
    if (!match[1].startsWith('.')) continue;
    const target = path.resolve(path.dirname(file), match[1]);
    if (!target.startsWith(output + path.sep)) throw new Error(`Import escapes output: ${file}`);
    await readFile(target);
    imports++;
  }
}
console.log(`PASS web build: ${publicFiles.length} public files, ${imports} local imports, cache ${version}`);

await import('./verify_web.mjs');

