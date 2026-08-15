export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    const avatarCell = cells[0];
    const name = cells[1]?.textContent.trim() || '';
    const role = cells[2]?.textContent.trim() || '';
    const vertical = cells[3]?.textContent.trim() || '';
    const link = cells[4]?.querySelector('a')?.getAttribute('href') || cells[4]?.textContent.trim() || '';

    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'team-card';
    if (link) card.href = link;

    // Check if the first cell contains an image
    const img = avatarCell?.querySelector('img');
    let avatarHTML;
    if (img) {
      img.alt = name || '';
      img.loading = 'lazy';
      img.width = 56;
      img.height = 56;
      avatarHTML = `<div class="team-avatar team-avatar-img" aria-hidden="true">${img.outerHTML}</div>`;
    } else {
      const initials = avatarCell?.textContent.trim() || '';
      avatarHTML = `<div class="team-avatar" aria-hidden="true">${initials}</div>`;
    }

    card.innerHTML = `
      ${avatarHTML}
      <div class="team-info">
        <div class="team-name">${name}</div>
        <div class="team-role">${role}</div>
        ${vertical ? `<span class="team-badge">${vertical}</span>` : ''}
      </div>`;
    return card;
  });

  const grid = document.createElement('div');
  grid.className = 'team-grid';
  items.forEach((card) => grid.append(card));

  block.innerHTML = '';
  block.append(grid);
}
