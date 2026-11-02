import sys
from pypdf import PdfReader
path = sys.argv[1]
r = PdfReader(path)
print("pages:", len(r.pages))
for i, p in enumerate(r.pages[:6]):
    t = (p.extract_text() or "").strip()
    print("=== page", i + 1, "chars", len(t))
    print(t[:1500])
