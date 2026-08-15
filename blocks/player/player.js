/* player — ESPN-style bio page for an XSC "trading card" team member.
   Reads labelled key/value rows authored in DA and renders a header band
   (card art + name + meta + stat box), a meta strip, a biography grid,
   and a career-highlights section built from the card's ability/attack. */

function readRows(block) {
  const data = {};
  let image = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = (cells[0]?.textContent || '').trim().toLowerCase();
    if (!key) return;
    const valCell = cells[1] || cells[0];
    const pic = valCell.querySelector('picture, img');
    if (key === 'image' && pic) { image = pic.closest('picture') || pic; return; }
    data[key] = valCell.innerHTML.trim();
    data[`${key}_text`] = (valCell.textContent || '').trim();
  });
  return { data, image };
}

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

function stat(value, label, sub) {
  return `<div class="player-stat"><span class="player-stat-value">${value || '—'}</span>`
    + `<span class="player-stat-label">${label}</span>`
    + `<span class="player-stat-sub">${sub || ''}</span></div>`;
}

function field(label, value) {
  if (!value) return '';
  return `<div class="player-field"><span class="player-field-label">${label}</span>`
    + `<span class="player-field-value">${value}</span></div>`;
}

export default function decorate(block) {
  const { data, image } = readRows(block);
  const g = (k) => data[`${k}_text`] || '';

  const shot = el('div', 'player-shot');
  if (image) {
    const img = image.querySelector('img');
    if (img) { img.loading = 'eager'; img.alt = g('name') || 'Player card'; }
    shot.append(image);
  }

  const statbox = el('div', 'player-statbox');
  statbox.innerHTML = `
    <div class="player-statbox-title">XSC Trading Card Stats</div>
    <div class="player-stats">
      ${stat(g('hp'), 'HP', 'Durability')}
      ${stat(g('power'), 'PWR', 'Signature Move')}
      ${stat(g('retreat'), 'RTR', 'Retreat Cost')}
      ${stat(g('resist') ? g('resist').replace(/[^-\d]/g, '') || '—' : '', 'RES', 'Resistance')}
    </div>`;

  const headline = el('div', 'player-headline');
  headline.innerHTML = `
    <p class="player-eyebrow">${g('eyebrow') || 'AEM Expert Solution Consulting'}</p>
    <h1 class="player-name">${g('name')}</h1>
    <p class="player-meta">
      ${g('category') ? `<span class="player-badge">${g('category')}</span>` : ''}
      <span class="player-role">${g('role')}</span>
    </p>
    <div class="player-actions">
      <span class="player-follow">+ Follow</span>
      <a class="player-back" href="/#people">All XSC Players</a>
    </div>`;
  headline.append(statbox);

  const header = el('div', 'player-header');
  header.append(shot, headline);

  // meta strip (ESPN HT/WT row)
  const strip = el('div', 'player-strip');
  strip.innerHTML = [
    field('ALIGNMENT', g('alignment')),
    field('ABILITY', g('ability')),
    field('STATUS', '<span class="player-active">Active</span>'),
    field('EDITION', g('edition') || '1st'),
    field('ILLUS', g('illus') || 'Firefly'),
  ].join('');

  // biography
  const bio = el('section', 'player-section');
  bio.innerHTML = `<h2 class="player-h2">Biography</h2>
    <div class="player-bio-grid">
      ${field('TEAM', 'XSC — AEM Expert Solution Consulting')}
      ${field('PRACTICE', g('category'))}
      ${field('ROLE', g('role'))}
      ${field('ALIGNMENT', g('alignment'))}
      ${field('HP', g('hp'))}
      ${field('RETREAT COST', g('retreat'))}
      ${field('WEAKNESS', g('weakness'))}
      ${field('RESISTANCE', g('resist'))}
    </div>`;

  // career highlights = powers
  const hi = el('section', 'player-section');
  hi.innerHTML = `<h2 class="player-h2">Career Highlights</h2>
    <div class="player-highlights">
      <div class="player-power">
        <div class="player-power-kind">Ability</div>
        <div class="player-power-name">${g('ability')}</div>
        <p class="player-power-text">${g('abilitytext')}</p>
      </div>
      <div class="player-power">
        <div class="player-power-kind">Signature Move${g('power') ? ` · ${g('power')} PWR` : ''}</div>
        <div class="player-power-name">${g('attack')}</div>
        <p class="player-power-text">${g('attacktext')}</p>
      </div>
    </div>`;

  const wrap = el('div', 'player-inner');
  wrap.append(header, strip, bio, hi);

  if (g('flavor')) {
    const q = el('blockquote', 'player-flavor', `“${g('flavor')}”`);
    wrap.append(q);
  }

  block.innerHTML = '';
  block.append(wrap);
}
