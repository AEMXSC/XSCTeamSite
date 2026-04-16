/*
 * booth-cards — clickable status cards for the overview page
 *
 * DA authoring (status | linked-title | meta | description):
 *   | booth-cards | | | |
 *   | ready | [Station 1](/summit/station-1) | 4 workstations · 2 scripts | Tagline text |
 *   | wip   | [AEM Sites](/summit/aem-sites) | 4 workstations · 4 demos   | Tagline text |
 *   | tbd   | [LLM Optimizer](/summit/llm-optimizer) | 2 workstations | TBD |
 *
 * status values: ready | wip | tbd
 */
export default function decorate(block) {
  const STATUS = {
    ready: { label: 'Ready',       cls: 'bc-ready' },
    wip:   { label: 'In Progress', cls: 'bc-wip'   },
    tbd:   { label: 'TBD',         cls: 'bc-tbd'   },
  };

  const cards = [...block.children].map((row) => {
    const cells = [...row.children];
    const statusKey = cells[0]?.textContent.trim().toLowerCase() || 'wip';
    const status = STATUS[statusKey] || STATUS.wip;
    const linkEl = cells[1]?.querySelector('a');
    const title = linkEl?.textContent.trim() || cells[1]?.textContent.trim() || '';
    const href = linkEl?.getAttribute('href') || '#';
    const meta = cells[2]?.textContent.trim() || '';
    const desc = cells[3]?.textContent.trim() || '';

    return `
      <a href="${href}" class="bc-card">
        <div class="bc-card-top">
          <span class="bc-dot ${status.cls}" aria-hidden="true"></span>
          <span class="bc-status-label ${status.cls}">${status.label}</span>
        </div>
        <h3 class="bc-title">${title}</h3>
        ${meta ? `<p class="bc-meta">${meta}</p>` : ''}
        ${desc ? `<p class="bc-desc">${desc}</p>` : ''}
        <span class="bc-arrow" aria-hidden="true">→</span>
      </a>
    `;
  });

  const grid = document.createElement('div');
  grid.className = 'bc-grid';
  grid.innerHTML = cards.join('');

  block.innerHTML = '';
  block.append(grid);
}
