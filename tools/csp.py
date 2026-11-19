#!/usr/bin/env python3
"""Atualiza a política de segurança de conteúdo (CSP) do app e do hub.

O código de cada página fica num único <script> embutido; a CSP só deixa rodar esse script
(pelo hash SHA-256 do conteúdo), o login do Google e arquivos do próprio site. Toda vez que o
<script> muda, o hash muda: rode este arquivo depois de editar index.html ou hub.html
(os testes recusam página com hash desatualizado).

    python3 tools/csp.py            # atualiza
    python3 tools/csp.py --check    # só confere (sai com erro se estiver desatualizado)
"""
import base64, hashlib, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GIS = 'https://accounts.google.com/gsi/'
COMMON = {
    'default-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'", GIS + 'style'],
    'font-src': ["'self'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'media-src': ["'self'", 'blob:'],
    'frame-src': [GIS],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'none'"],
}
PAGES = {
    # celular: Drive, login do Google e transcrição no Groq; o microfone usa um AudioWorklet criado de um blob
    'index.html': {'script-src': ["'self'", 'blob:', GIS], 'connect-src': ["'self'", 'https://www.googleapis.com', GIS, 'https://api.groq.com']},
    # hub: Drive e login do Google; o 7-Zip roda em WebAssembly
    'hub.html': {'script-src': ["'self'", "'wasm-unsafe-eval'", GIS], 'connect-src': ["'self'", 'https://www.googleapis.com', GIS]},
}
META = re.compile(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">\n')

def inline_script(html):
    m = [s for s in re.finditer(r'<script>(.*?)</script>', html, re.S)]
    if len(m) != 1: raise SystemExit('esperava 1 <script> embutido, achei %d' % len(m))
    return m[0].group(1)

def policy(name, html):
    h = base64.b64encode(hashlib.sha256(inline_script(html).encode('utf-8')).digest()).decode()
    d = dict(COMMON, **PAGES[name])
    d['script-src'] = d['script-src'][:1] + ["'sha256-%s'" % h] + d['script-src'][1:]
    return '; '.join(k + ' ' + ' '.join(v) for k, v in d.items())

def apply(name, html):
    tag = '<meta http-equiv="Content-Security-Policy" content="%s">\n' % policy(name, html)
    html = META.sub('', html)
    return re.sub(r'(<meta charset="[^"]*">\n)', lambda m: m.group(1) + tag, html, count=1)  # logo depois do charset, antes de qualquer script

if __name__ == '__main__':
    check = '--check' in sys.argv; bad = False
    for name in PAGES:
        p = ROOT / name; old = p.read_text(encoding='utf-8'); new = apply(name, old)
        if new != old:
            if check: print('CSP desatualizada em', name); bad = True
            else: p.write_text(new, encoding='utf-8'); print('CSP atualizada em', name)
    sys.exit(1 if bad else 0)
