/*
 * booth-staff — staff initials chips
 *
 * DA authoring (name | email rows):
 *   | booth-staff       |                    |
 *   | David Folk        | dfolk@adobe.com    |
 *   | Jamie Brighton    | jbright@adobe.com  |
 */
export default function decorate(block) {
  const staff = [...block.children].map((row) => {
    const cells = [...row.children];
    const name = cells[0]?.textContent.trim() || '';
    const email = cells[1]?.textContent.trim() || '';
    const initials = name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    return { name, email, initials };
  }).filter((s) => s.name);

  block.innerHTML = `
    <p class="bstaff-label">Booth Staff</p>
    <div class="bstaff-grid">
      ${staff.map((s) => `
        <div class="bstaff-chip">
          <div class="bstaff-initials" aria-hidden="true">${s.initials}</div>
          <div class="bstaff-info">
            <span class="bstaff-name">${s.name}</span>
            ${s.email ? `<a href="mailto:${s.email}" class="bstaff-email">${s.email}</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
