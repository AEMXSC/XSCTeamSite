const STATUS_MAP = {
  'ready':       { cls: 'bs-ready',    label: 'Ready' },
  'complete':    { cls: 'bs-ready',    label: 'Complete' },
  'enabled':     { cls: 'bs-ready',    label: 'Enabled' },
  'in progress': { cls: 'bs-wip',      label: 'In Progress' },
  'wip':         { cls: 'bs-wip',      label: 'In Progress' },
  'to do':       { cls: 'bs-todo',     label: 'TO DO' },
  'todo':        { cls: 'bs-todo',     label: 'TO DO' },
  'tbd':         { cls: 'bs-tbd',      label: 'TBD' },
};

function statusBadge(text) {
  const key = text.toLowerCase().replace(/[\s-]+/g, ' ').trim();
  const match = Object.entries(STATUS_MAP).find(([k]) => key.includes(k));
  if (!match) return `<span class="bs-status-text">${text}</span>`;
  const [, { cls, label }] = match;
  return `<span class="bs-badge ${cls}">${label}</span>`;
}

export default function decorate(block) {
  const rows = [...block.children];

  block.innerHTML = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const num    = cells[0]?.textContent.trim() || '';
    const body   = cells[1]?.innerHTML || '';
    const links  = [...(cells[2]?.querySelectorAll('a') || [])];
    const status = cells[3]?.textContent.trim() || '';

    const card = document.createElement('div');
    card.className = 'bs-card';

    const linksHTML = links.length
      ? `<div class="bs-links">${links.map((a) => `<a href="${a.href}" class="bs-link" target="_blank" rel="noopener">${a.textContent.trim()}</a>`).join('')}</div>`
      : '';

    const statusHTML = status
      ? `<div class="bs-status">${statusBadge(status)}</div>`
      : '';

    // Split on middle-dot separators used in DA content, render as paragraphs
    const formattedBody = body
      .split(/\s*·\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s, i) => `<p class="${i === 0 ? 'bs-body-lead' : 'bs-body-step'}">${s}</p>`)
      .join('');

    card.innerHTML = `
      <div class="bs-num">${num}</div>
      <div class="bs-content">
        <div class="bs-body">${formattedBody || body}</div>
        ${linksHTML}
        ${statusHTML}
      </div>
    `;

    block.appendChild(card);
  });
}
