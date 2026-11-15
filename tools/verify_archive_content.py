"""Confirm archive entries contain no Unicode bullet immediately followed by a space.

The check is byte-level and intentionally includes binary files. It does not
claim to alter glyphs in raster screenshots or the original supplied proposal.
"""
import sys
import zipfile
from pathlib import Path

NEEDLE='\u2022 '.encode('utf-8')

def verify(path:Path):
    errors=[]
    with zipfile.ZipFile(path) as z:
        for member in z.infolist():
            if member.is_dir():continue
            contents=z.read(member)
            if NEEDLE in contents:errors.append(member.filename)
            if member.filename.lower().endswith('.pdf'):
                try:
                    import fitz
                    with fitz.open(stream=contents,filetype='pdf') as doc:
                        if any('\u2022' in page.get_text() for page in doc):errors.append(member.filename+' [PDF text]')
                except ImportError:
                    print('WARNING: PyMuPDF not installed; PDF rendered-text check skipped')
    if errors:
        raise RuntimeError('Forbidden bullet-space sequence in: '+', '.join(errors[:20]))
    print(f'PASS: {len(z.namelist())} archive entries contain no UTF-8 bullet-space sequence')

if __name__=='__main__':
    verify(Path(sys.argv[1]))
