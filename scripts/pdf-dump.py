import sys
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
pages = [int(x) for x in sys.argv[2].split(",")]
for n in pages:
    p = r.pages[n-1]
    print("=== page", n)
    print(p.extract_text() or "")
