"""Generate SIMPUL_Standalone.html from the real ES-module dependency graph.

Why this exists
---------------
SIMPUL supports a single-file *offline demonstration* with zero JS dependencies.
We cannot simply paste modules in alphabetical order: imports must come first.
This build walks js/app.js recursively, validates local module paths, and
concatenates ES modules in dependency order. It never executes application code.

Only static named relative imports are supported. For bundled mode do not use
side-effect imports, namespace imports, dynamic import(), or alias re-exports.
A real bundler should replace this tool if those features become necessary.
"""
from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
ENTRY = ROOT / 'js' / 'app.js'
IMPORT_RE = re.compile(r"\bimport\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"]\s*;?")
EXPORT_RE = re.compile(r'(?m)^export\s+')


def dependency_order(entry: Path) -> list[Path]:
    order: list[Path] = []
    active: set[Path] = set()
    visited: set[Path] = set()
    root_js = (ROOT / 'js').resolve()

    def walk(file: Path) -> None:
        file = file.resolve()
        if not file.is_relative_to(root_js) or file.suffix != '.js' or not file.is_file():
            raise ValueError(f'Missing or forbidden JavaScript module: {file}')
        if file in active:
            raise ValueError(f'Circular frontend imports at: {file.relative_to(ROOT)}')
        if file in visited:
            return
        active.add(file)
        contents = file.read_text(encoding='utf-8')
        # Reject import forms that this deliberately minimal single-file bundler cannot process.
        if re.search(r'\bimport\s*\(', contents):
            raise ValueError(f'Dynamic import unsupported: {file.relative_to(ROOT)}')
        for symbols, target in IMPORT_RE.findall(contents):
            if re.search(r"\bas\b", symbols):
                raise ValueError(f'Aliased imports are unsupported by the standalone bundler: {file}')
            if not target.startswith('.'):
                raise ValueError(f'External import unsupported: {target} in {file}')
            walk(file.parent / target)
        active.remove(file)
        visited.add(file)
        order.append(file)

    walk(entry)
    return order


def bundle_js(files: list[Path]) -> str:
    chunks = []
    for file in files:
        src = file.read_text(encoding='utf-8')
        src = IMPORT_RE.sub('', src)
        # Do not silently ship an unhandled default, namespace, or side-effect import.
        if re.search(r'(?m)(?:^|;)\s*import\s', src):
            raise ValueError(f'Unsupported import declaration: {file.relative_to(ROOT)}')
        src = EXPORT_RE.sub('', src)
        chunks.append(f'// SOURCE MODULE: {file.relative_to(ROOT).as_posix()}\n{src}')
    return '\n\n'.join(chunks)


def refresh_pwa_cache_manifest(files: list[Path]) -> None:
    """Keep the offline PWA cache synchronized with the actual module graph.

    The separate standalone HTML does not need this cache; the served PWA does.
    Old hand-maintained cache lists missed new page modules and broke offline use.
    """
    sw_path = ROOT / 'sw.js'
    existing = sw_path.read_text(encoding='utf-8')
    gsap_local = ROOT / 'assets/vendor/gsap.min.js'
    assets = ['./', './index.html', './styles.css', './manifest.webmanifest',
              './assets/favicon.svg', './assets/itb-seal.png', './assets/aiera-foundation.png', *(f'./{file.relative_to(ROOT).as_posix()}' for file in files)]
    if gsap_local.is_file():
        assets.append('./assets/vendor/gsap.min.js')
    assets.extend('./' + p.relative_to(ROOT).as_posix() for p in sorted((ROOT/'assets/vendor/leaflet').rglob('*')) if p.is_file())
    digest = hashlib.sha256()
    for name in assets:
        path = ROOT / name.removeprefix('./')
        if path.is_file():
            digest.update(path.read_bytes())
    cache_name = 'simpul-v19-vehicle-first-' + digest.hexdigest()[:12]
    updated = re.sub(r"const CACHE='[^']+';", f"const CACHE='{cache_name}';", existing, count=1)
    updated = re.sub(r'const ASSETS=\[.*?\];', 'const ASSETS=' + json.dumps(assets, separators=(',', ':')) + ';', updated, count=1)
    if updated == existing and 'simpul-v19-vehicle-first' not in updated:
        raise ValueError('Missing service worker cache declarations')
    sw_path.write_text(updated, encoding='utf-8')


def build() -> tuple[int, int]:
    modules = dependency_order(ENTRY)
    js = bundle_js(modules)
    seal = base64.b64encode((ROOT / 'assets/itb-seal.png').read_bytes()).decode()
    js = js.replace('./assets/itb-seal.png', 'data:image/png;base64,' + seal)
    aiera = base64.b64encode((ROOT / 'assets/aiera-foundation.png').read_bytes()).decode()
    js = js.replace('/assets/aiera-foundation.png', 'data:image/png;base64,' + aiera)
    refresh_pwa_cache_manifest(modules)
    css = (ROOT / 'styles.css').read_text(encoding='utf-8')
    css = re.sub(r'^@import\s+url\(.*?\);\s*', '', css, count=1)
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    html = re.sub(r'\s*<link rel="stylesheet"[^>]+>', '', html)
    html = re.sub(r'\s*<link rel="manifest"[^>]+>', '', html)
    icon = base64.b64encode((ROOT / 'assets/favicon.svg').read_bytes()).decode()
    html = html.replace('<link rel="icon" href="./assets/favicon.svg" type="image/svg+xml" />',
                        f'<link rel="icon" href="data:image/svg+xml;base64,{icon}" type="image/svg+xml" />')
    optional_gsap = ROOT / 'assets/vendor/gsap.min.js'
    optional_script = '<script defer src="./assets/vendor/gsap.min.js"></script>'
    if optional_script in html:
        if not optional_gsap.is_file():
            raise ValueError('GSAP script tag present without a locally installed runtime')
        # The standalone demo remains self-contained when GSAP is opted into.
        html = html.replace(optional_script, '<script>\n' + optional_gsap.read_text(encoding='utf-8') + '\n</script>')
    marker = '<script type="module" src="./js/app.js"></script>'
    if marker not in html:
        raise ValueError('Could not locate application entrypoint in index.html')
    html = html.replace(marker, f'<script type="module">\n{js}\n</script>')
    html = html.replace('</head>', f'<style>\n{css}\n</style></head>')
    (ROOT / 'SIMPUL_Standalone.html').write_text(html, encoding='utf-8')
    tmp_dir = ROOT / 'tmp'
    tmp_dir.mkdir(exist_ok=True)
    (tmp_dir / 'bundled_app.js').write_text(js, encoding='utf-8')
    return len(modules), (ROOT / 'SIMPUL_Standalone.html').stat().st_size


if __name__ == '__main__':
    count, size = build()
    print(f'PASS standalone build: {count} JS modules, {size:,} bytes')

