#!/usr/bin/env python3
"""Explicitly approved, local source-code-only Strix assessment launcher.

It stages only application source in a temporary directory; no .env, database,
proposal PDF, user data, or credentials are copied to the scan target. This
script DOES NOT run Strix automatically on import or CI.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
COPY_DIRS = ('server', 'js', 'tests', 'tools')
COPY_FILES = ('index.html', 'styles.css', 'package.json', 'sw.js',
              'Dockerfile', 'docker-compose.yml', 'README.md', 'AGENTS.md')


def safe_copy(src: Path, target: Path) -> None:
    if src.is_dir():
        shutil.copytree(src, target, ignore=shutil.ignore_patterns(
            '__pycache__', '*.pyc', '*.sqlite3', '*.sqlite3-*', '.env',
            'node_modules', '.pytest_cache', '.DS_Store', 'strix_runs',
            '*_Standalone.html', '.git', '*.log'))
    elif src.is_file():
        shutil.copy2(src, target)


def main() -> int:
    parser = argparse.ArgumentParser(description='Manual, authorized local-only Strix source review of SIMPUL')
    parser.add_argument('--authorize-local-scan', action='store_true', help='Confirm this application source is yours to assess')
    parser.add_argument('--accept-llm-egress', action='store_true', help='Confirm code from the sanitized scan copy may be sent to the configured Strix LLM provider')
    args = parser.parse_args()
    if not (args.authorize_local_scan and args.accept_llm_egress):
        parser.error('Explicit --authorize-local-scan and --accept-llm-egress are both required.')
    if not shutil.which('docker'):
        print('NOT RUN: Docker CLI is unavailable. Install Docker Desktop/Engine and start the daemon.', file=sys.stderr)
        return 2
    if not shutil.which('strix'):
        print('NOT RUN: Strix CLI is unavailable. Follow docs/security/STRIX_LOCAL_RUNBOOK.md.', file=sys.stderr)
        return 2
    if subprocess.run(['docker', 'info'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=12).returncode:
        print('NOT RUN: Docker daemon is not available.', file=sys.stderr)
        return 2
    with tempfile.TemporaryDirectory(prefix='simpul_strix_source_') as tmp:
        staging = Path(tmp) / 'simpul-source'
        staging.mkdir()
        for part in COPY_DIRS + COPY_FILES:
            safe_copy(ROOT / part, staging / part)
        print('Running Strix on a temporary local, source-only copy. No public domain is targeted.')
        print('Source code may leave your machine through the configured LLM provider.')
        instructions = (
            'Authorized assessment of this local SIMPUL academic prototype source ONLY. '
            'Do not scan internet hosts, third-party providers, Fatmawati infrastructure, '
            'or unrelated machines. Never use live API keys or personal data. '
            'Prefer non-destructive validation of OWASP risks; document evidence and '
            'propose minimal fixes. Synthetic/test data only.'
        )
        result = subprocess.run(
            ['strix', '-n', '--target', str(staging), '--scan-mode', 'quick',
             '--instruction', instructions], cwd=ROOT, check=False,
        )
        return result.returncode


if __name__ == '__main__':
    raise SystemExit(main())
