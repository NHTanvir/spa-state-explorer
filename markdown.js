// Pure: render a probe/scan result as Markdown for notes.
import { findInteresting } from './interesting.js';
export function toMarkdown(data, meta = {}) {
  const L = [`# SPA state${meta.host ? ' — ' + meta.host : ''}`, ''];
  const hits = data.probe ? findInteresting(data.probe.state) : [];
  const exposure = hits.filter((h) => h.kind === 'exposure');
  const leads = hits.filter((h) => h.kind !== 'exposure');
  if (exposure.length) {
    L.push('## Data exposure (reportable as-is)', '');
    for (const h of exposure) L.push(`- \`${h.path}\` (**${h.key}**, ${h.severity}) = ${h.value}`);
    L.push('');
  }
  if (leads.length) {
    L.push('## Leads (need a server request to confirm)', '');
    for (const h of leads) L.push(`- \`${h.path}\` (**${h.key}**, ${h.category}) = ${h.value}`);
    L.push('');
  }
  if ((data.routes || []).length) { L.push('## Routes', '', ...data.routes.map((r) => `- \`${r}\``), ''); }
  if ((data.endpoints || []).length) { L.push('## Endpoints', '', ...data.endpoints.map((e) => `- \`${e}\``), ''); }
  return L.join('\n');
}
