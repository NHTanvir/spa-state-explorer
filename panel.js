import { findInteresting } from './interesting.js';

let data = {};
let tab = 'interesting';
const body = document.getElementById('body');
const search = document.getElementById('search');
function esc(s){return String(s).replace(/[&<>]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

async function tabId(){ const [t]=await chrome.tabs.query({active:true,currentWindow:true}); return t?t.id:null; }

function render() {
  const q = search.value.toLowerCase();
  if (tab === 'state') {
    const txt = data.probe ? JSON.stringify(data.probe.state, null, 2) : '';
    body.innerHTML = txt ? `<pre>${esc(q ? txt.split('\n').filter((l)=>l.toLowerCase().includes(q)).join('\n') : txt)}</pre>`
                         : '<p class="muted">Click “Read state”.</p>';
  } else if (tab === 'interesting') {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    const hits = (data.probe ? findInteresting(data.probe.state) : [])
      .slice().sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'exposure' ? -1 : 1) || (order[a.severity] - order[b.severity]));
    const shown = hits.filter((h) => !q || (h.path + h.value).toLowerCase().includes(q));
    body.innerHTML = shown.length ? shown.map((h) =>
      `<div class="hit"><span class="badge ${h.kind === 'exposure' ? 'exp' : 'lead'}">${h.kind === 'exposure' ? 'EXPOSURE' : 'lead'}</span> `
      + `<span class="k">${esc(h.key)}</span> <span class="cat">${esc(h.category || '')}</span> <code>${esc(h.path)}</code> = ${esc(h.value)}</div>`).join('')
      : '<p class="muted">No interesting keys (read state first).</p>';
  } else if (tab === 'routes') {
    const rs = (data.routes || []).filter((r) => !q || r.toLowerCase().includes(q));
    body.innerHTML = rs.length ? rs.map((r) => `<div class="hit"><code>${esc(r)}</code></div>`).join('')
      : '<p class="muted">Click “Scan routes”.</p>';
  } else {
    const es = (data.endpoints || []).filter((e) => !q || e.toLowerCase().includes(q));
    body.innerHTML = es.length ? es.map((e) => `<div class="hit"><code>${esc(e)}</code></div>`).join('')
      : '<p class="muted">Click “Scan routes”.</p>';
  }
}

async function refresh(){ const id = await tabId(); if (id==null) return; data = await chrome.runtime.sendMessage({ type:'spa-get', tabId:id }); render(); }

document.querySelectorAll('nav button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('nav button').forEach((x) => x.classList.remove('active'));
  b.classList.add('active'); tab = b.dataset.tab; render();
}));
search.addEventListener('input', render);
document.getElementById('run').addEventListener('click', async () => {
  const id = await tabId();
  const r = await chrome.runtime.sendMessage({ type:'spa-run', tabId:id });
  if (r && r.error) { body.innerHTML = `<p class="muted">${esc(r.error)} — add the host to scope and reload.</p>`; return; }
  data = r; render();
});
document.getElementById('scan').addEventListener('click', async () => {
  const id = await tabId();
  const r = await chrome.runtime.sendMessage({ type:'spa-routes', tabId:id });
  if (r && r.error) { body.innerHTML = `<p class="muted">${esc(r.error)}.</p>`; return; }
  data = r; render();
});
document.getElementById('copy').addEventListener('click', async () => {
  const { toMarkdown } = await import('./markdown.js');
  let host=''; try { const [t]=await chrome.tabs.query({active:true,currentWindow:true}); host=new URL(t.url).host; } catch {}
  navigator.clipboard.writeText(toMarkdown(data, { host })).catch(() => {});
});
chrome.tabs.onActivated.addListener(refresh);
refresh();
