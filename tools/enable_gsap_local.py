"""Opt-in: install a pinned GSAP UMD build as a self-hosted browser asset.

This script needs npm network access. It changes only the local workspace.
Run `python tools/enable_gsap_local.py`, then `npm run build:standalone`.
Default SIMPUL works offline with native Web Animations API without this step.
"""
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
VERSION='3.15.1'
SOURCE=ROOT/'node_modules/gsap/dist/gsap.min.js'
TARGET=ROOT/'assets/vendor/gsap.min.js'
INDEX=ROOT/'index.html'
MARKER='<script type="module" src="./js/app.js"></script>'
TAG='<script defer src="./assets/vendor/gsap.min.js"></script>'


def main():
    if not SOURCE.exists():
        subprocess.run(['npm','install',f'gsap@{VERSION}','--no-save','--no-package-lock','--ignore-scripts'],cwd=ROOT,check=True)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SOURCE,TARGET)
    content=INDEX.read_text(encoding='utf-8')
    if MARKER not in content:
        raise RuntimeError('Application script entrypoint missing; refusing to modify index.html')
    if TAG not in content:
        content=content.replace(MARKER,TAG+'\n  '+MARKER)
        INDEX.write_text(content,encoding='utf-8')
    print(f'Self-hosted GSAP {VERSION} installed at {TARGET.relative_to(ROOT)}. Run npm run build:standalone')


if __name__=='__main__':main()
