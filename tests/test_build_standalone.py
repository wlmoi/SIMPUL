"""Contract tests for the dependency-discovered standalone bundler."""
from pathlib import Path
import pytest
import json
import re
from tools.build_standalone import ENTRY, ROOT, dependency_order, bundle_js


def test_dependency_graph_includes_new_modules_and_entry_last():
    modules = dependency_order(ENTRY)
    rel = {str(x.relative_to(ROOT)) for x in modules}
    assert 'js/page-registry.js' in rel
    assert 'js/services/export-data.js' in rel
    assert 'js/services/csv.js' in rel
    assert modules[-1] == ENTRY.resolve()
    assert len(modules) == len(set(modules))
    output = bundle_js(modules)
    assert 'SOURCE MODULE: js/page-registry.js' in output
    assert 'SOURCE MODULE: js/app.js' in output
    assert "import {" not in output


def test_rejects_missing_or_outside_files(tmp_path):
    bad = tmp_path / 'missing.js'
    with pytest.raises(ValueError):
        dependency_order(bad)


def test_pwa_cache_covers_every_loaded_js_module():
    worker = (ROOT / 'sw.js').read_text(encoding='utf-8')
    match = re.search(r'const ASSETS=(\[.*?\]);', worker)
    assert match, 'Service worker must contain an asset manifest'
    assets = set(json.loads(match.group(1)))
    modules = dependency_order(ENTRY)
    assert all('./' + file.relative_to(ROOT).as_posix() in assets for file in modules)
    assert './styles.css' in assets
    assert 'simpul-v19-vehicle-first' in worker
