"""Keep the polished README operational instead of letting local links rot."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent


def test_all_readme_local_links_exist():
    text = (ROOT / 'README.md').read_text(encoding='utf-8')
    links = re.findall(r'(?<!!)\[[^]]+\]\(([^)]+)\)', text)
    local = [url.split('#', 1)[0] for url in links
             if url and not url.startswith(('http://', 'https://', '#'))]
    missing = [path for path in local if not (ROOT / path).is_file()]
    assert local, 'README must include links to source and docs'
    assert not missing, f'Broken README references: {missing}'


def test_readme_hero_is_valid_svg():
    path = ROOT / 'docs/assets/readme-hero.svg'
    root = ET.parse(path).getroot()
    assert root.tag.endswith('svg')
    assert 'viewBox' in root.attrib
