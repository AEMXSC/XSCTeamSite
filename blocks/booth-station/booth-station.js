/*
 * booth-station — header block for quest station + product workstation pages
 *
 * DA authoring (key | value rows):
 *   | booth-station | |
 *   | type          | quest  OR  product             |
 *   | station       | Station 1 — Discover AI Rep    |
 *   | workstations  | 4                              |
 *   | demos         | 2                              |
 *   | narrative     | Uncover gaps in how AI...      |
 *   | owners        | Mark Szulc · Martin Buergi     |
 */
export default function decorate(block) {
  const data = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells[0]?.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    if (!key || !cells[1]) return;
    // Use textContent for scalar fields to avoid nested <p> from DA wrapping
    // textContent for all plain-text fields — prevents nested <p> and avoids
    // any XSS risk if a DA author pastes unexpected HTML into a cell
    const SCALAR = ['type', 'workstations', 'demos', 'owners', 'station', 'title', 'narrative'];
    data[key] = SCALAR.includes(key)
      ? cells[1].textContent.trim()
      : cells[1].innerHTML.trim();
  });

  const isQuest = (data.type || '').toLowerCase() === 'quest';
  const eyebrow = isQuest ? 'Experience Flywheel · Quest Station' : 'Product Workstation';

  const metaParts = [
    data.workstations && `${data.workstations} workstation${data.workstations !== '1' ? 's' : ''}`,
    data.demos && `${data.demos} demo${data.demos !== '1' ? 's' : ''}`,
  ].filter(Boolean);

  block.innerHTML = `
    <div class="bs-breadcrumb"><a href="/summit">← Brand Visibility</a></div>
    <p class="bs-eyebrow">${eyebrow}</p>
    <h1 class="bs-title">${data.station || data.title || ''}</h1>
    ${metaParts.length ? `<p class="bs-meta">${metaParts.join(' · ')}</p>` : ''}
    ${data.narrative ? `<p class="bs-narrative">${data.narrative}</p>` : ''}
    ${data.owners ? `
      <div class="bs-owners">
        <span class="bs-label">Owners</span>
        <span class="bs-owners-list">${data.owners}</span>
      </div>` : ''}
  `;
}
