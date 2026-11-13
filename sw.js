// forenSIS — service worker: guarda a página no celular para o app abrir sem internet.
// Só trata arquivos do próprio app (mesma origem e mesma pasta). Drive, Groq e login do Google
// passam direto, sem cópia. Nenhuma foto ou texto do exame passa por aqui.
'use strict';
const CACHE = 'forensis-app-1';
const CORE = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
const BASE = new URL('./', self.location).href;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('forensis-app-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Página principal: abre na hora com a cópia guardada e busca a versão nova em segundo plano;
// se mudou, avisa a página (a versão nova entra na próxima abertura, nunca no meio do exame).
async function notify(msg) { for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage(msg); }
async function refreshPage(cache, cachedText) {
  try {
    const res = await fetch(BASE, { cache: 'no-cache' });
    if (!res.ok) return;
    const text = await res.clone().text();
    if (text === cachedText) return;
    await cache.put(BASE, res);
    if (cachedText != null) notify({ type: 'updated', version: versionOf(text) });
  } catch (e) { /* sem conexão: fica a cópia guardada */ }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;
  const rel = url.pathname.slice(new URL(BASE).pathname.length);
  const isApp = req.mode === 'navigate' && (rel === '' || rel === 'index.html');
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isApp) {
      const cached = await cache.match(BASE);
      if (cached) {
        const text = await cached.clone().text();
        e.waitUntil(refreshPage(cache, text));
        return cached;
      }
      try { const res = await fetch(req); if (res.ok) await cache.put(BASE, res.clone()); return res; }
      catch (err) { return new Response('<meta charset="utf-8"><p style="font:16px sans-serif;padding:24px">forenSIS: sem conexão e sem cópia guardada neste aparelho. Abra o app uma vez com internet.</p>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }
    }
    // Demais arquivos do app (ícones, manifesto, diagnóstico): rede primeiro, cópia se estiver sem sinal.
    try { const res = await fetch(req); if (res.ok && CORE.includes(rel)) await cache.put(req, res.clone()); return res; }
    catch (err) { const c = await cache.match(req, { ignoreSearch: true }); if (c) return c; throw err; }
  })());
});

// A página pede para checar versão nova (ao abrir e ao voltar para o app).
// Responde com a versão guardada, que é a que abre da próxima vez; a página compara com a sua.
const versionOf = text => { const m = text && text.match(/const VERSION = '([^']+)'/); return m ? m[1] : ''; };
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'check') return;
  e.waitUntil(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(BASE);
    await refreshPage(cache, cached ? await cached.text() : null);
    const now = await cache.match(BASE);
    if (e.source && now) e.source.postMessage({ type: 'version', version: versionOf(await now.text()) });
  }));
});
