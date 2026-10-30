"""Check local navigation, assets, fragments and accessibility references without network access."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs, self.controls, self.errors = path, [], [], [], []
        self.h1 = 0
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'img' and 'alt' not in a: self.errors.append('image missing alt')
        if tag == 'a' and a.get('target') == '_blank' and 'noopener' not in a.get('rel', ''): self.errors.append('new-window link missing noopener')
        for key in ('href', 'src', 'poster'):
            if a.get(key): self.refs.append(a[key])
        if a.get('srcset'):
            self.refs.extend(item.strip().split()[0] for item in a['srcset'].split(','))
        for key in ('aria-controls', 'aria-labelledby', 'aria-describedby'):
            self.controls.extend(a.get(key, '').split())
    handle_startendtag = handle_starttag

def main():
    pages = {p.resolve(): Page(p) for p in ROOT.rglob('*.html') if 'node_modules' not in p.parts and '.git' not in p.parts}
    errors = []
    count = 0
    for path, page in pages.items():
        local = page.errors[:]
        if page.h1 != 1: local.append(f'expected one h1, found {page.h1}')
        local.extend(f'duplicate id: {i}' for i, n in Counter(page.ids).items() if n > 1)
        local.extend(f'missing ARIA target: {i}' for i in page.controls if i not in page.ids)
        for ref in page.refs:
            u = urlparse(ref)
            if u.scheme or u.netloc: continue
            target = (ROOT / unquote(u.path).lstrip('/') if u.path.startswith('/') else path.parent / unquote(u.path)).resolve() if u.path else path
            if target.is_dir(): target /= 'index.html'
            if not target.is_file(): local.append(f'missing local target: {ref}'); continue
            count += 1
            if u.fragment:
                if target.suffix == '.html': ids = pages[target].ids
                elif target.suffix == '.svg': ids = [n.get('id') for n in ET.parse(target).iter()]
                else: continue
                if unquote(u.fragment) not in ids: local.append(f'missing fragment: {ref}')
        errors.extend(f'{path.relative_to(ROOT)}: {e}' for e in local)
    print(json.dumps({'pages': len(pages), 'local_references': count, 'errors': errors}, ensure_ascii=False, indent=2))
    return bool(errors)
if __name__ == '__main__': sys.exit(main())
