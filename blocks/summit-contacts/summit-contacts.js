/*
 * Summit Contacts — collapsible SC contact list with Slack + tel: actions.
 *
 * Doc config:
 *   | summit-contacts |
 *   | /summit/contacts-data.json |   ← row 0: JSON URL (optional)
 *   | C1234567890 |                  ← row 1: Slack channel ID
 *
 * Slack deeplink: slack://channel?team=&id=CHANNEL_ID
 * Fallback web:  https://app.slack.com/client/TEAM/CHANNEL_ID
 */

const DEFAULT_CONTACTS_URL = '/summit/contacts-data.json';

// app_redirect works without a team ID and opens the Slack app on mobile
// Priority: individual DM via handle → channel fallback
function buildSlackHref(channelId, slackHandle) {
  const handle = (slackHandle || '').replace(/^@/, '');
  if (handle) return `https://slack.com/app_redirect?channel=@${handle}`;
  if (channelId) return `https://slack.com/app_redirect?channel=${channelId}`;
  return null;
}

export default async function decorate(block) {
  const rows = [...block.children];

  const configUrl = rows[0]?.querySelector('a')?.href
    || rows[0]?.textContent.trim()
    || DEFAULT_CONTACTS_URL;
  const channelId = rows[1]?.textContent.trim() || '';

  block.innerHTML = '';
  block.className = 'summit-contacts';

  // Collapsible header
  const summary = document.createElement('button');
  summary.className = 'sc-toggle';
  summary.setAttribute('aria-expanded', 'false');
  summary.setAttribute('aria-controls', 'sc-list');
  summary.innerHTML = `
    <span class="sc-toggle-label">SC Contacts — Tap to Slack</span>
    <span class="sc-toggle-icon" aria-hidden="true"></span>`;
  block.append(summary);

  const listWrap = document.createElement('div');
  listWrap.id = 'sc-list';
  listWrap.className = 'sc-list-wrap sc-collapsed';
  block.append(listWrap);

  summary.addEventListener('click', () => {
    const expanded = summary.getAttribute('aria-expanded') === 'true';
    summary.setAttribute('aria-expanded', !expanded);
    listWrap.classList.toggle('sc-collapsed', expanded);
    if (!expanded && !listWrap.dataset.loaded) {
      loadContacts();
    }
  });

  async function loadContacts() {
    listWrap.dataset.loaded = '1';
    listWrap.innerHTML = '<p class="sc-loading">Loading contacts…</p>';

    let contacts = [];
    try {
      const resp = await fetch(configUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      contacts = (await resp.json()).data || [];
    } catch {
      listWrap.innerHTML = '<p class="sc-error">Could not load contacts.</p>';
      return;
    }

    if (!contacts.length) {
      listWrap.innerHTML = '<p class="sc-error">No contacts in sheet.</p>';
      return;
    }

    const items = contacts.map((c) => {
      const name = c.name || '';
      const role = c.role || '';
      const coverage = c.product_coverage || '';
      const phone = (c.phone || '').replace(/\s/g, '');
      const slackHandle = c.slack_handle || '';
      const displayHandle = slackHandle.startsWith('@') ? slackHandle : `@${slackHandle}`;

      const slackHref = buildSlackHref(channelId, slackHandle);
      const hasPhone = phone.length > 0;
      const hasSlack = !!slackHref;

      return `<div class="sc-item">
        <div class="sc-item-info">
          <div class="sc-item-name">${name}</div>
          ${role ? `<div class="sc-item-role">${role}</div>` : ''}
          ${coverage ? `<div class="sc-item-coverage">${coverage}</div>` : ''}
          ${slackHandle ? `<div class="sc-item-handle">${displayHandle}</div>` : ''}
        </div>
        <div class="sc-item-actions">
          ${hasSlack ? `<a href="${slackHref}" class="sc-btn sc-btn-slack" target="_blank" rel="noopener" aria-label="Slack ${name}">Slack</a>` : ''}
          ${hasPhone ? `<a href="tel:${phone}" class="sc-btn sc-btn-call" aria-label="Call ${name}">${c.phone}</a>` : ''}
        </div>
      </div>`;
    }).join('');

    listWrap.innerHTML = `<div class="sc-list">${items}</div>`;
  }
}
