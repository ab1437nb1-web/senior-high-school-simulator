import sys
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
for i, p in enumerate(r.pages):
    t = p.extract_text() or ""
    print(i + 1, len(t), repr(t[:80]))
