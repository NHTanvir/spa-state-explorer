import { getScope, hostInScope } from './scope.js';
// Probe runs on demand via chrome.scripting.executeScript (MAIN world);
// no persistent content script needed. Scope is enforced before injecting.
chrome.action.onClicked.addListener((tab) => { if (tab.windowId != null) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {}); });

async function inScope(url) {
  let host = ''; try { host = new URL(url).hostname; } catch { return false; }
  return hostInScope(host, await getScope());
}
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg && msg.type === 'spa-inscope') { inScope(msg.url).then((v) => sendResponse({ inScope: v })); return true; }
});
