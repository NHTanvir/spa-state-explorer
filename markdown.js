// Pure: render a probe/scan result as Markdown for notes.
import { findInteresting } from './interesting.js';
export function toMarkdown(data, meta = {}) {
  const L = [`# SPA state${meta.host ? ' — ' + meta.host : ''}`, ''];
  const hits = data.probe ? findInteresting(data.probe.state) : [];
  if (hits.length) {
    L.push('## Interesting values', '');
    for (const h of hits) L.push(`- \`${h.path}\` (**${h.key}**) = ${h.value}`);
    L.push('');
  }
  if ((data.routes || []).length) { L.push('## Routes', '', ...data.routes.map((r) => `- \`${r}\``), ''); }
  if ((data.endpoints || []).length) { L.push('## Endpoints', '', ...data.endpoints.map((e) => `- \`${e}\``), ''); }
  return L.join('\n');
}
