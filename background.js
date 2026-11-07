import { getScope, hostInScope } from './scope.js';
import { extractRoutes, extractEndpoints } from './routes.js';

chrome.action.onClicked.addListener((tab) => { if (tab.windowId != null) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {}); });

async function inScope(url) {
  let host = ''; try { host = new URL(url).hostname; } catch { return false; }
  return hostInScope(host, await getScope());
}

const K = (tabId) => `spa_${tabId}`;

// Run the MAIN-world probe in the tab (scope enforced first) and store result.
async function runProbe(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!(await inScope(tab.url))) return { error: 'out-of-scope' };
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    files: ['probe.js'],
  }).catch(() => [null]);
  // probe.js defines globalThis.runProbe; call it in a second injection
  const [out] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => (globalThis.runProbe ? globalThis.runProbe() : null),
  }).catch(() => [null]);
  const result = out && out.result;
  if (!result) return { error: 'probe-failed' };
  const prev = (await chrome.storage.session.get(K(tabId)))[K(tabId)] || {};
  const merged = { ...prev, probe: result };
  await chrome.storage.session.set({ [K(tabId)]: merged });
  return merged;
}

// Fetch same-origin scripts the page already loaded (in-page, so same origin)
// and extract routes + endpoints from their text + the state snapshot.
async function scanRoutes(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (!(await inScope(tab.url))) return { error: 'out-of-scope' };
  const [out] = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: async () => {
      const urls = [...document.scripts].map((s) => s.src).filter((u) => {
        try { return u && new URL(u).origin === location.origin; } catch { return false; }
      }).slice(0, 25);
      let text = '';
      for (const u of urls) {
        try { const r = await fetch(u); text += '\n' + (await r.text()).slice(0, 200000); } catch {}
        if (text.length > 2000000) break;
      }
      // include inline scripts and the serialized NEXT data too
      for (const s of document.scripts) if (!s.src) text += '\n' + (s.textContent || '').slice(0, 100000);
      return text;
    },
  }).catch(() => [null]);
  const text = (out && out.result) || '';
  const routes = extractRoutes(text);
  const endpoints = extractEndpoints(text);
  const prev = (await chrome.storage.session.get(K(tabId)))[K(tabId)] || {};
  const merged = { ...prev, routes, endpoints };
  await chrome.storage.session.set({ [K(tabId)]: merged });
  return merged;
}

chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg && msg.type === 'spa-inscope') { inScope(msg.url).then((v) => sendResponse({ inScope: v })); return true; }
  if (msg && msg.type === 'spa-run') { runProbe(msg.tabId).then(sendResponse); return true; }
  if (msg && msg.type === 'spa-routes') { scanRoutes(msg.tabId).then(sendResponse); return true; }
  if (msg && msg.type === 'spa-get') {
    chrome.storage.session.get(K(msg.tabId)).then((o) => sendResponse(o[K(msg.tabId)] || {}));
    return true;
  }
});
chrome.tabs.onRemoved.addListener((t) => chrome.storage.session.remove(K(t)));
