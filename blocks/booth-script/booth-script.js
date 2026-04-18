if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

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

const VIDEO_EXTS = /\.(mp4|mov|webm|m4v)(\?.*)?$/i;

// .mov served as video/quicktime won't play on Windows Chrome — force video/mp4 so
// Chrome uses its H.264 decoder (works for any H.264-encoded .mov file)
function videoType(href) {
  const ext = href.split('?')[0].split('.').pop().toLowerCase();
  return ext === 'webm' ? 'video/webm' : 'video/mp4';
}

function statusBadge(text) {
  const key = text.toLowerCase().replace(/[\s-]+/g, ' ').trim();
  const match = Object.entries(STATUS_MAP).find(([k]) => key.includes(k));
  if (!match) return `<span class="bs-status-text">${text}</span>`;
  const [, { cls, label }] = match;
  return `<span class="bs-badge ${cls}">${label}</span>`;
}

function extractTitle(bodyHTML) {
  const tmp = document.createElement('div');
  tmp.innerHTML = bodyHTML;
  const heading = tmp.querySelector('h3, h2, h4');
  if (heading) return heading.textContent.trim();
  const firstP = tmp.querySelector('p');
  if (firstP) {
    const strong = firstP.querySelector('strong, b');
    if (strong) return strong.textContent.trim();
    const t = firstP.textContent.trim();
    return t.length > 72 ? `${t.slice(0, 69)}\u2026` : t;
  }
  return '';
}

// DA sanitizes <video> elements — convert video links in body HTML to inline players
function embedVideoLinks(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('a').forEach((a) => {
    if (!VIDEO_EXTS.test(a.href)) return;
    const video = document.createElement('video');
    video.controls = true;
    video.style.cssText = 'width:100%;border-radius:8px;margin-top:8px;display:block;';
    const source = document.createElement('source');
    source.src = a.href;
    source.type = videoType(a.href);
    video.appendChild(source);
    // Replace the link's parent <p> if it's the only content, otherwise replace the link itself
    const parent = a.parentElement;
    if (parent && parent.tagName === 'P' && parent.childNodes.length === 1) {
      parent.replaceWith(video);
    } else {
      a.replaceWith(video);
    }
  });
  return tmp.innerHTML;
}

const CHEVRON_SVG = `<svg class="bs-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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

    // Split links column into videos (embed inline) and regular links (buttons)
    const videoLinks = links.filter((a) => VIDEO_EXTS.test(a.href));
    const regularLinks = links.filter((a) => !VIDEO_EXTS.test(a.href));

    const videosHTML = videoLinks.map((a) =>
      `<video controls style="width:100%;border-radius:8px;margin-bottom:10px;display:block;"><source src="${a.href}" type="${videoType(a.href)}"></video>`
    ).join('');

    const linksHTML = regularLinks.length
      ? `<div class="bs-links">${regularLinks.map((a) => `<a href="${a.href}" class="bs-link" target="_blank" rel="noopener">${a.textContent.trim()}</a>`).join('')}</div>`
      : '';

    const statusHTML = status
      ? `<div class="bs-status">${statusBadge(status)}</div>`
      : '';

    const hasBlockHTML = /<(p|ul|ol|li|h[1-6]|blockquote)\b/i.test(body);
    const segments = hasBlockHTML ? [] : body.split(/\s*·\s*/).map((s) => s.trim()).filter(Boolean);
    const rawBody = segments.length > 1
      ? segments.map((s, i) => `<p class="${i === 0 ? 'bs-body-lead' : 'bs-body-step'}">${s}</p>`).join('')
      : body;

    // Convert any video links in body to inline players
    const formattedBody = embedVideoLinks(rawBody);
    const title = extractTitle(rawBody);

    card.innerHTML = `
      <div class="bs-num">${num}</div>
      <div class="bs-content">
        <button class="bs-toggle" aria-expanded="false" aria-label="Toggle script details">
          <span class="bs-title">${title}</span>
          ${CHEVRON_SVG}
        </button>
        <div class="bs-collapse">
          ${videosHTML}
          <div class="bs-body">${formattedBody}</div>
          ${linksHTML}
        </div>
        ${statusHTML}
      </div>
    `;

    const toggleBtn = card.querySelector('.bs-toggle');
    toggleBtn?.addEventListener('click', () => {
      const expanded = card.classList.toggle('expanded');
      toggleBtn.setAttribute('aria-expanded', String(expanded));
    });

    block.appendChild(card);
  });
}
