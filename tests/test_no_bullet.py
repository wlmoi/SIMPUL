"""User-requested literal formatting constraint, including embedded PDF text."""
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parent.parent
NEEDLE='\u2022 '.encode('utf-8')

def test_no_bullet_space_in_any_package_file():
    matches=[]
    for p in ROOT.rglob('*'):
        if any(part in {'__pycache__', '.pytest_cache', '.git', 'node_modules'} for part in p.parts) or p.suffix in {'.pyc', '.pyo'}:
            continue
        if p.is_file() and NEEDLE in p.read_bytes():
            matches.append(str(p.relative_to(ROOT)))
    assert not matches, 'Forbidden literal bullet-space pattern: '+', '.join(matches[:30])

def test_no_bullet_in_reference_pdf():
    for path in (ROOT/'reference').glob('*.pdf'):
        with fitz.open(path) as doc:
            assert all('\u2022' not in page.get_text() for page in doc),path.name
