/**
 * summit-playbook — auto-enhances /summit/* content pages.
 *
 * Activated via scripts.js path detection — no DA block needed.
 * Transforms rendered DA content:
 *  - h2 sections → collapsible accordions
 *  - Status table cells → color-coded badges (Ready/WIP/TO DO/Enabled)
 *  - Metadata rows (Type/Workstations) → hidden
 *  - Broken video placeholders → Watch Demo link buttons
 */

const STATUS_MAP = {
  ready:       { cls: 'sp-status-ready',   label: 'Ready' },
  enabled:     { cls: 'sp-status-ready',   label: 'Enabled' },
  complete:    { cls: 'sp-status-ready',   label: 'Complete' },
  wip:         { cls: 'sp-status-wip',     label: 'In Progress' },
  'in progress': { cls: 'sp-status-wip',  label: 'In Progress' },
  'todo':      { cls: 'sp-status-todo',    label: 'TO DO' },
  'to do':     { cls: 'sp-status-todo',    label: 'TO DO' },
  tbd:         { cls: 'sp-status-tbd',     label: 'TBD' },
};

function statusBadge(text) {
  const key = text.trim().toLowerCase().replace(/[\s-]+/g, ' ');
  const match = Object.entries(STATUS_MAP).find(([k]) => key.includes(k));
  if (!match) return null;
  const [, { cls, label }] = match;
  return `<span class="sp-status-badge ${cls}">${label}</span>`;
}

function enhanceStatusCells(table) {
  table.querySelectorAll('td:last-child').forEach((td) => {
    const raw = td.textContent.trim();
    const badge = statusBadge(raw);
    if (badge) td.innerHTML = badge;
  });
}

function hideMetadataRows(main) {
  main.querySelectorAll('p, div').forEach((el) => {
    const t = el.textContent.trim();
    if (/^(type|product|workstations|demos)\s*:/i.test(t) && t.length < 60) {
      el.closest('.default-content-wrapper')?.querySelectorAll('p').forEach((p) => {
        if (/^(type|product|workstations|demos)\s*:/i.test(p.textContent.trim())) {
          p.style.display = 'none';
        }
      });
    }
  });
}

function fixBrokenVideos(main) {
  main.querySelectorAll('p').forEach((p) => {
    if (p.textContent.includes('does not support the HTML5 video element')) {
      const prev = p.previousElementSibling;
      const link = prev?.querySelector('a');
      if (link) {
        const btn = document.createElement('a');
        btn.className = 'sp-video-btn';
        btn.href = link.href;
        btn.target = '_blank';
        btn.rel = 'noopener';
        btn.textContent = '▶ Watch Demo';
        p.replaceWith(btn);
      } else {
        p.style.display = 'none';
      }
    }
  });
}

function buildAccordions(main) {
  const sections = main.querySelectorAll('.section');
  sections.forEach((section) => {
    const contentWrapper = section.querySelector('.default-content-wrapper');
    if (!contentWrapper) return;

    const headings = [...contentWrapper.querySelectorAll('h2')];
    if (headings.length < 2) return;

    headings.forEach((h2, i) => {
      const accordion = document.createElement('div');
      accordion.className = 'sp-accordion';

      const trigger = document.createElement('button');
      trigger.className = 'sp-accordion-trigger';
      trigger.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      trigger.innerHTML = `<span class="sp-accordion-title">${h2.innerHTML}</span><span class="sp-accordion-chevron" aria-hidden="true"></span>`;

      const body = document.createElement('div');
      body.className = 'sp-accordion-body';
      if (i !== 0) body.hidden = true;

      // Collect all siblings until the next h2
      const siblings = [];
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'H2') {
        siblings.push(next);
        next = next.nextElementSibling;
      }
      siblings.forEach((el) => body.append(el));

      trigger.addEventListener('click', () => {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        body.hidden = expanded;
      });

      accordion.append(trigger, body);
      h2.replaceWith(accordion);
    });
  });
}

export default function init(main) {
  hideMetadataRows(main);
  fixBrokenVideos(main);

  main.querySelectorAll('table').forEach((table) => {
    // Mark script tables (first header cell is "#")
    const firstTh = table.querySelector('th');
    if (firstTh?.textContent.trim() === '#') {
      table.classList.add('sp-script-table');
      enhanceStatusCells(table);
    }
  });

  buildAccordions(main);
  main.classList.add('sp-playbook');
}
