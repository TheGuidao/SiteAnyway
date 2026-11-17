"""Valida os arquivos locais, âncoras, metadados e conteúdo essencial, sem dependências."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from collections import Counter
import json
import re

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

pages = {p.name: Page(p.read_text()) for p in ROOT.glob('*.html')}
for filename, page in pages.items():
    ids = [a['id'] for _, a in page.tags if 'id' in a]
    assert not [key for key, count in Counter(ids).items() if count > 1], f'{filename}: ID duplicado'
    assert sum(tag == 'h1' for tag, _ in page.tags) == 1, f'{filename}: título principal'
    assert any(tag == 'meta' and a.get('name') == 'description' for tag, a in page.tags)
    assert any(tag == 'link' and a.get('rel') == 'canonical' for tag, a in page.tags)
    for tag, attrs in page.tags:
        if tag == 'img': assert 'alt' in attrs, f'{filename}: imagem sem alt'
        if tag == 'iframe': assert attrs.get('title'), f'{filename}: iframe sem título'
        if attrs.get('target') == '_blank': assert 'noopener' in attrs.get('rel', '')
        for key in ('href', 'src'):
            if key not in attrs: continue
            value = attrs[key]
            assert value != '#', f'{filename}: link vazio'
            url = urlsplit(value)
            if url.scheme or url.netloc: continue
            target = unquote(url.path)
            if target == '/': target = 'index.html'
            path = ROOT / target.lstrip('/') if target else ROOT / filename
            assert path.exists(), f'{filename}: arquivo ausente {value}'
            if url.fragment and path.suffix == '.html':
                target_ids = {a.get('id') for _, a in pages[path.name].tags}
                assert url.fragment in target_ids, f'{filename}: âncora ausente {value}'
    source = (ROOT / filename).read_text()
    for data in re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S):
        json.loads(data)

for value in re.findall(r'url\([\'"]?([^\)\'\"]+)', (ROOT / 'style.css').read_text()):
    assert (ROOT / value).exists(), f'CSS: arquivo ausente {value}'
assert (ROOT / 'CNAME').read_text().strip() == 'bandanyway.com.br'
assert sum(tag == 'a' and 'track' in attrs.get('class', '').split() for tag, attrs in pages['lancamentos.html'].tags) == 6
for filename in ('index.html', 'lancamentos.html'):
    assert any(tag == 'iframe' and '/album/0spaoQvWEuGP67r1fBMhmv' in a.get('src','') for tag,a in pages[filename].tags)
assert sum(tag == 'article' and 'member' in a.get('class','').split() for tag,a in pages['sobre.html'].tags) == 7
assert 'trabalhando em um EP' not in (ROOT / 'sobre.html').read_text()
print(f'OK: {len(pages)} páginas, arquivos e âncoras locais, 6 faixas, 7 integrantes, player do EP e CNAME.')
