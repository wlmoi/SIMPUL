"""Validate the agent-readable module ownership catalog without extra dependencies.

Run: python tools/check_module_catalog.py
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VALID = {'implemented_local','local_mock_verified','synthetic_only','illustrative_only','optional_credentials'}


def check_catalog() -> int:
    content = json.loads((ROOT / 'config/module-catalog.json').read_text(encoding='utf-8'))
    assert content['schemaVersion'] == 1
    assert (ROOT / content['sourceOfTruth']).is_file()
    ids = set()
    files = set()
    for item in content['modules']:
        assert item['id'] not in ids, f"Duplicate id: {item['id']}"
        assert item['status'] in VALID, item['status']
        assert item['source'] and item['tests'] and item['interfaces']
        ids.add(item['id'])
        for file in item['source'] + item['tests']:
            resolved = (ROOT / file).resolve()
            assert resolved.is_relative_to(ROOT), f"Path traversal: {file}"
            assert resolved.is_file(), f"Missing module dependency: {file}"
            files.add(file)
    for required in ('server/api_registry.py','js/page-registry.js','js/services/export-data.js'):
        assert required in files, f"New boundary absent from catalog: {required}"
    print(f'PASS module catalog: {len(ids)} modules, {len(files)} unique source/test paths')
    return len(ids)


if __name__ == '__main__':
    check_catalog()
